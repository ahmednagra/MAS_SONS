# tests/stock/test_upload_service.py

# Trust-boundary checks in UploadService (the single upload code path) that need no
# database: allow-list, size bound, magic-byte sniffing, and key derivation.
import pytest
from fastapi import HTTPException

from app.Core.Storage.storage_constants import MAX_UPLOAD_SIZE_BYTES
from app.Services.UploadService import UploadService, _content_key

JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 16
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 16
WEBP = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 8
PDF = b"%PDF-1.7\n" + b"\x00" * 16
HTML = b"<html><script>alert(1)</script>"
RIFF_WAVE = b"RIFF\x00\x00\x00\x00WAVEfmt "


def test_validate_accepts_real_bytes_and_returns_extension():
    assert UploadService.validate("unit_photo", "image/jpeg", JPEG) == "jpg"
    assert UploadService.validate("unit_photo", "image/png", PNG) == "png"
    assert UploadService.validate("unit_photo", "image/webp", WEBP) == "webp"
    assert UploadService.validate("auction_sheet", "application/pdf", PDF) == "pdf"
    assert UploadService.validate("review_photo", "image/jpeg", JPEG) == "jpg"


# Short string ids keep pytest's output readable — never let raw bytes become an id.
REJECTS = {
    "unknown-purpose": ("nope", "image/jpeg", JPEG),
    "pdf-not-a-photo": ("unit_photo", "application/pdf", PDF),
    "webp-not-a-sheet": ("auction_sheet", "image/webp", WEBP),
    "empty": ("unit_photo", "image/jpeg", b""),
    "no-declared-type": ("unit_photo", None, JPEG),
    "declared-jpeg-bytes-png": ("unit_photo", "image/jpeg", PNG),
    "riff-but-not-webp": ("unit_photo", "image/webp", RIFF_WAVE),
    "html-renamed-to-jpg": ("unit_photo", "image/jpeg", HTML),
}


@pytest.mark.parametrize("case", list(REJECTS), ids=list(REJECTS))
def test_validate_rejects(case):
    purpose, ctype, content = REJECTS[case]
    with pytest.raises(HTTPException) as exc:
        UploadService.validate(purpose, ctype, content)
    assert exc.value.status_code == 400


def test_validate_rejects_oversize():
    too_big = b"\xff\xd8\xff" + b"\x00" * MAX_UPLOAD_SIZE_BYTES
    with pytest.raises(HTTPException) as exc:
        UploadService.validate("unit_photo", "image/jpeg", too_big)
    assert exc.value.status_code == 400


def test_content_key_is_deterministic_and_scoped_to_unit():
    a = _content_key(7, "exterior", b"same-bytes", "jpg")
    assert a == _content_key(7, "exterior", b"same-bytes", "jpg")
    assert a != _content_key(8, "exterior", b"same-bytes", "jpg")
    assert a != _content_key(7, "interior", b"same-bytes", "jpg")
    assert a.startswith("units/7/exterior/") and a.endswith(".jpg")
