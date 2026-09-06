# app/Services/DestinationService.py
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Destination
from app.Schemas.destination import DestinationResponse, DestinationUpsert


class DestinationService:
    @staticmethod
    def list_all(db: Session) -> list[DestinationResponse]:
        stmt = select(Destination).where(Destination.deleted_at.is_(None)).order_by(Destination.country_name)
        rows = db.execute(stmt).scalars().all()
        return [DestinationResponse.model_validate(r) for r in rows]

    @staticmethod
    def get_by_country(country_code: str, db: Session) -> DestinationResponse:
        row = db.get(Destination, country_code.upper())
        if row is None or row.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Destination not found")
        return DestinationResponse.model_validate(row)

    @staticmethod
    def upsert(data: DestinationUpsert, db: Session) -> DestinationResponse:
        payload = data.model_dump()
        row = db.get(Destination, payload["country_code"])
        if row is None:
            row = Destination(**payload)
            db.add(row)
        else:
            for field, value in payload.items():
                setattr(row, field, value)
        db.commit()
        db.refresh(row)
        return DestinationResponse.model_validate(row)
