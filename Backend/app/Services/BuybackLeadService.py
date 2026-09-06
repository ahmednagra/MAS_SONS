# app/Services/BuybackLeadService.py
# Domestic (JP) buyback leads: guest create, staff listing and status updates.
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import BuybackLead, BuybackLeadPhoto
from app.Schemas.buyback_lead import (
    BuybackLeadCreate, BuybackLeadPhotoResponse, BuybackLeadResponse, BuybackLeadStatusUpdate,
)
from app.Utils.Query import children_by_parent, get_live, keyset_page, to_schema


class BuybackLeadService:
    @staticmethod
    def create(data: BuybackLeadCreate, db: Session) -> BuybackLeadResponse:
        row = BuybackLead(
            name=data.name, phone=data.phone,
            vehicle_or_equipment_description=data.vehicle_or_equipment_description,
        )
        db.add(row)
        db.flush()
        db.add_all(
            BuybackLeadPhoto(buyback_lead_id=row.id, url=url, sort_order=i) for i, url in enumerate(data.photo_urls)
        )
        db.commit()
        db.refresh(row)
        return BuybackLeadService._to_responses([row], db)[0]

    @staticmethod
    def _to_responses(rows: Sequence[BuybackLead], db: Session) -> list[BuybackLeadResponse]:
        """Serialize a page with one batched photo query instead of one per lead."""
        photos = children_by_parent(
            db, BuybackLeadPhoto, BuybackLeadPhoto.buyback_lead_id, [r.id for r in rows], BuybackLeadPhoto.sort_order,
        )
        return [
            to_schema(BuybackLeadResponse, row, photos=[BuybackLeadPhotoResponse.model_validate(p) for p in photos.get(row.id, [])])
            for row in rows
        ]

    @staticmethod
    def get_by_id(id: int, db: Session) -> BuybackLeadResponse:
        row = get_live(db, BuybackLead, id, "Buyback lead not found")
        return BuybackLeadService._to_responses([row], db)[0]

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[BuybackLeadResponse]:
        stmt = select(BuybackLead).where(BuybackLead.deleted_at.is_(None))
        if status_filter:
            stmt = stmt.where(BuybackLead.status == status_filter)
        rows = db.execute(keyset_page(stmt, BuybackLead.id, cursor, limit)).scalars().all()
        return BuybackLeadService._to_responses(rows, db)

    @staticmethod
    def update_status(id: int, data: BuybackLeadStatusUpdate, db: Session) -> BuybackLeadResponse:
        row = get_live(db, BuybackLead, id, "Buyback lead not found")
        row.status = data.status
        db.commit()
        db.refresh(row)
        return BuybackLeadService._to_responses([row], db)[0]
