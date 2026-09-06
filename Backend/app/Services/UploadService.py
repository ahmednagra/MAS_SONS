# app/Services/UploadService.py
# The one service that writes files into storage (Core/Storage) — for every purpose.
import hashlib
import uuid
from datetime import datetime, timezone
from pathlib import PurePosixPath
from typing import Optional

from fastapi import HTTPException, UploadFile, status
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.Core.Storage.storage_constants import ALLOWED_CONTENT_TYPES, MAX_UPLOAD_SIZE_BYTES
from app.Core.Storage.storage_factory import get_storage_provider
from app.Models import Unit, UnitImage
from app.Schemas.stock import UnitImageResponse
from app.Schemas.upload import UploadResponse

PHOTO_TYPES = ("exterior", "interior", "engine_bay", "undercarriage", "odometer", "other")
MAX_PHOTOS_PER_UNIT = 60

_EXTENSION = {"image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "application/pdf": "pdf"}

# Leading bytes for every content type any purpose allows.
_MAGIC = {
    "image/jpeg": b"\xff\xd8\xff",
    "image/png": b"\x89PNG\r\n\x1a\n",
    "image/webp": b"RIFF",  # + "WEBP" at offset 8, checked below
    "application/pdf": b"%PDF-",
}


def _matches_magic(content_type: str, content: bytes) -> bool:
    prefix = _MAGIC.get(content_type)
    if prefix is None or not content.startswith(prefix):
        return False
    if content_type == "image/webp":
        return content[8:12] == b"WEBP"
    return True


def _content_key(unit_id: int, folder: str, content: bytes, ext: str) -> str:
    """Content-addressed key: the same bytes always map to the same object, which is what makes re-uploading a catalog photo idempotent."""
    digest = hashlib.sha256(content).hexdigest()[:20]
    return str(PurePosixPath("units") / str(unit_id) / folder / f"{digest}.{ext}")


class UploadService:
    # ------------------------------------------------------------------ shared
    @staticmethod
    def validate(purpose: str, content_type: Optional[str], content: bytes) -> str:
        """Enforce purpose allow-list, size bound, and magic bytes."""
        allowed = ALLOWED_CONTENT_TYPES.get(purpose)
        if allowed is None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown upload purpose")
        if content_type not in allowed:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unsupported content type for {purpose}")
        if not content:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Empty file")
        if len(content) > MAX_UPLOAD_SIZE_BYTES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")
        if not _matches_magic(content_type, content):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File content does not match its declared type")
        return _EXTENSION[content_type]

    # ---------------------------------------------------------------- detached
    @staticmethod
    def upload(purpose: str, file: UploadFile, content: bytes) -> UploadResponse:
        """POST /uploads — store now, attach later via a `photo_urls` field."""
        ext = UploadService.validate(purpose, file.content_type, content)
        key = f"{purpose}/{uuid.uuid4().hex}.{ext}"
        url = get_storage_provider().save(key=key, content=content, content_type=file.content_type)
        return UploadResponse(url=url, key=key)

    # ---------------------------------------------------------------- attached
    @staticmethod
    def _unit(unit_id: int, db: Session) -> Unit:
        unit = db.get(Unit, unit_id)
        if unit is None or unit.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
        return unit

    @staticmethod
    def attach_unit_photo(
        unit_id: int, *, content: bytes, content_type: Optional[str], photo_type: str,
        sort_order: Optional[int], alt_text: Optional[str], db: Session,
    ) -> tuple[UnitImageResponse, bool]:
        """Store one gallery photo and its unit_images row."""
        if photo_type not in PHOTO_TYPES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"photo_type must be one of {', '.join(PHOTO_TYPES)}")
        ext = UploadService.validate("unit_photo", content_type, content)
        UploadService._unit(unit_id, db)

        live = db.execute(
            select(func.count(UnitImage.id)).where(UnitImage.unit_id == unit_id, UnitImage.deleted_at.is_(None))
        ).scalar_one()
        if live >= MAX_PHOTOS_PER_UNIT:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Gallery is capped at {MAX_PHOTOS_PER_UNIT} photos")

        key = _content_key(unit_id, photo_type, content, ext)
        url = get_storage_provider().save(key=key, content=content, content_type=content_type)

        existing = db.execute(select(UnitImage).where(UnitImage.unit_id == unit_id, UnitImage.url == url)).scalar_one_or_none()
        if existing is not None:
            if existing.deleted_at is not None:  # re-attaching a removed photo restores the row
                existing.deleted_at, existing.deleted_by = None, None
                db.flush()
            return UnitImageResponse.model_validate(existing), False

        if sort_order is None:
            sort_order = int(db.execute(
                select(func.coalesce(func.max(UnitImage.sort_order), -1))
                .where(UnitImage.unit_id == unit_id, UnitImage.deleted_at.is_(None))
            ).scalar_one()) + 1

        image = UnitImage(unit_id=unit_id, url=url, photo_type=photo_type, alt_text=alt_text, sort_order=sort_order)
        db.add(image)
        db.flush()
        return UnitImageResponse.model_validate(image), True

    @staticmethod
    def remove_unit_photo(unit_id: int, image_id: int, *, actor_user_id: Optional[int], db: Session) -> None:
        image = db.get(UnitImage, image_id)
        if image is None or image.unit_id != unit_id or image.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Photo not found")
        # Soft delete only; the stored object is content-addressed and may be restored.
        image.deleted_at = datetime.now(timezone.utc)
        image.deleted_by = actor_user_id
        db.flush()

    @staticmethod
    def attach_unit_auction_sheet(unit_id: int, *, content: bytes, content_type: Optional[str], db: Session) -> str:
        ext = UploadService.validate("auction_sheet", content_type, content)
        unit = UploadService._unit(unit_id, db)
        key = _content_key(unit_id, "auction-sheet", content, ext)
        unit.auction_sheet_url = get_storage_provider().save(key=key, content=content, content_type=content_type)
        db.flush()
        return unit.auction_sheet_url
