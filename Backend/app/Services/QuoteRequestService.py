# app/Services/QuoteRequestService.py
# Quote requests: guest/buyer create, owner or staff read, staff quoting.
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.Models import QuoteRequest, User
from app.Schemas.quote_request import QuoteRequestCreate, QuoteRequestQuote, QuoteRequestResponse
from app.Utils.Query import first_live, keyset_page


def _to_response(row: QuoteRequest) -> QuoteRequestResponse:
    response = QuoteRequestResponse.model_validate(row)
    if row.unit is not None:
        response.unit_make = row.unit.make
        response.unit_model = row.unit.model
        response.unit_year = row.unit.year
    return response


def _with_unit():
    return select(QuoteRequest).options(selectinload(QuoteRequest.unit))


class QuoteRequestService:
    @staticmethod
    def create(data: QuoteRequestCreate, user: Optional[User], db: Session) -> QuoteRequestResponse:
        row = QuoteRequest(**data.model_dump(), user_id=user.id if user else None)
        db.add(row)
        db.commit()
        db.refresh(row)
        return _to_response(row)

    @staticmethod
    def _get_owned_or_staff(id: int, current_user: User, db: Session) -> QuoteRequest:
        row = first_live(db, _with_unit().where(QuoteRequest.id == id), "Quote request not found")
        if current_user.user_type != "staff" and row.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your quote request")
        return row

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> QuoteRequestResponse:
        return _to_response(QuoteRequestService._get_owned_or_staff(id, current_user, db))

    @staticmethod
    def list_mine(user: User, cursor: Optional[int], limit: int, db: Session) -> list[QuoteRequestResponse]:
        stmt = _with_unit().where(QuoteRequest.user_id == user.id, QuoteRequest.deleted_at.is_(None))
        rows = db.execute(keyset_page(stmt, QuoteRequest.id, cursor, limit)).scalars().all()
        return [_to_response(r) for r in rows]

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[QuoteRequestResponse]:
        stmt = _with_unit().where(QuoteRequest.deleted_at.is_(None))
        if status_filter:
            stmt = stmt.where(QuoteRequest.status == status_filter)
        rows = db.execute(keyset_page(stmt, QuoteRequest.id, cursor, limit)).scalars().all()
        return [_to_response(r) for r in rows]

    @staticmethod
    def quote(id: int, data: QuoteRequestQuote, db: Session) -> QuoteRequestResponse:
        row = first_live(db, _with_unit().where(QuoteRequest.id == id), "Quote request not found")
        row.quoted_price_usd = data.quoted_price_usd
        row.status = "quoted"
        row.quoted_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(row)
        return _to_response(row)
