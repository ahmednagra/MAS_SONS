# app/Services/QuoteRequestService.py
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import QuoteRequest, User
from app.Schemas.quote_request import QuoteRequestCreate, QuoteRequestQuote, QuoteRequestResponse
from datetime import datetime, timezone


class QuoteRequestService:
    @staticmethod
    def create(data: QuoteRequestCreate, user: Optional[User], db: Session) -> QuoteRequestResponse:
        row = QuoteRequest(**data.model_dump(), user_id=user.id if user else None)
        db.add(row)
        db.commit()
        db.refresh(row)
        return QuoteRequestResponse.model_validate(row)

    @staticmethod
    def _get_owned_or_staff(id: int, current_user: User, db: Session) -> QuoteRequest:
        row = db.get(QuoteRequest, id)
        if row is None or row.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote request not found")
        if current_user.user_type != "staff" and row.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your quote request")
        return row

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> QuoteRequestResponse:
        return QuoteRequestResponse.model_validate(QuoteRequestService._get_owned_or_staff(id, current_user, db))

    @staticmethod
    def list_mine(user: User, cursor: Optional[int], limit: int, db: Session) -> list[QuoteRequestResponse]:
        stmt = select(QuoteRequest).where(QuoteRequest.user_id == user.id, QuoteRequest.deleted_at.is_(None))
        if cursor is not None:
            stmt = stmt.where(QuoteRequest.id < cursor)
        stmt = stmt.order_by(QuoteRequest.id.desc()).limit(limit)
        rows = db.execute(stmt).scalars().all()
        return [QuoteRequestResponse.model_validate(r) for r in rows]

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[QuoteRequestResponse]:
        stmt = select(QuoteRequest).where(QuoteRequest.deleted_at.is_(None))
        if status_filter:
            stmt = stmt.where(QuoteRequest.status == status_filter)
        if cursor is not None:
            stmt = stmt.where(QuoteRequest.id < cursor)
        stmt = stmt.order_by(QuoteRequest.id.desc()).limit(limit)
        rows = db.execute(stmt).scalars().all()
        return [QuoteRequestResponse.model_validate(r) for r in rows]

    @staticmethod
    def quote(id: int, data: QuoteRequestQuote, db: Session) -> QuoteRequestResponse:
        row = db.get(QuoteRequest, id)
        if row is None or row.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Quote request not found")
        row.quoted_price_usd = data.quoted_price_usd
        row.status = "quoted"
        row.quoted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(row)
        return QuoteRequestResponse.model_validate(row)
