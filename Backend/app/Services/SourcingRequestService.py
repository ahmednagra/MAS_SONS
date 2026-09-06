# app/Services/SourcingRequestService.py
# Sourcing requests: guest/buyer create, owner or staff read, staff status updates.
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import SourcingRequest, User
from app.Schemas.sourcing_request import (
    SourcingRequestCreate, SourcingRequestResponse, SourcingRequestStatusUpdate,
)
from app.Utils.Query import get_live, keyset_page


class SourcingRequestService:
    @staticmethod
    def create(data: SourcingRequestCreate, user: Optional[User], db: Session) -> SourcingRequestResponse:
        row = SourcingRequest(**data.model_dump(), user_id=user.id if user else None)
        db.add(row)
        db.commit()
        db.refresh(row)
        return SourcingRequestResponse.model_validate(row)

    @staticmethod
    def _get_owned_or_staff(id: int, current_user: User, db: Session) -> SourcingRequest:
        row = get_live(db, SourcingRequest, id, "Sourcing request not found")
        if current_user.user_type != "staff" and row.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your sourcing request")
        return row

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> SourcingRequestResponse:
        return SourcingRequestResponse.model_validate(SourcingRequestService._get_owned_or_staff(id, current_user, db))

    @staticmethod
    def list_mine(user: User, cursor: Optional[int], limit: int, db: Session) -> list[SourcingRequestResponse]:
        stmt = select(SourcingRequest).where(SourcingRequest.user_id == user.id, SourcingRequest.deleted_at.is_(None))
        rows = db.execute(keyset_page(stmt, SourcingRequest.id, cursor, limit)).scalars().all()
        return [SourcingRequestResponse.model_validate(r) for r in rows]

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[SourcingRequestResponse]:
        stmt = select(SourcingRequest).where(SourcingRequest.deleted_at.is_(None))
        if status_filter:
            stmt = stmt.where(SourcingRequest.status == status_filter)
        rows = db.execute(keyset_page(stmt, SourcingRequest.id, cursor, limit)).scalars().all()
        return [SourcingRequestResponse.model_validate(r) for r in rows]

    @staticmethod
    def update_status(id: int, data: SourcingRequestStatusUpdate, db: Session) -> SourcingRequestResponse:
        row = get_live(db, SourcingRequest, id, "Sourcing request not found")
        row.status = data.status
        db.commit()
        db.refresh(row)
        return SourcingRequestResponse.model_validate(row)
