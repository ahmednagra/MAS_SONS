# app/Controllers/admin/AdminStockController.py
from fastapi import HTTPException
from sqlalchemy.orm import Session

from typing import Optional

from app.Models import Unit, User
from app.Schemas.stock import UnitImageResponse, UnitPriceUpdate, UnitResponse
from app.Services.StockService import StockService
from app.Services.UploadService import UploadService
from app.Utils import Audit
from app.Utils.Logger import logger


class AdminStockController:
    @staticmethod
    def update_price(id: int, data: UnitPriceUpdate, staff: User, db: Session) -> UnitResponse:
        try:
            response = StockService.update_price(id, data, db)
            Audit.record(
                db, entity_type="unit", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id, changed_fields={"price_usd": data.price_usd},
            )
            db.commit()
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_price: {e}")
            raise

    @staticmethod
    def add_photo(
        id: int, *, content: bytes, content_type: Optional[str], photo_type: str,
        sort_order: Optional[int], alt_text: Optional[str], staff: User, db: Session,
    ) -> UnitImageResponse:
        try:
            image, created = UploadService.attach_unit_photo(
                id, content=content, content_type=content_type, photo_type=photo_type,
                sort_order=sort_order, alt_text=alt_text, db=db,
            )
            if created:
                Audit.record(
                    db, entity_type="unit", entity_id=id, action="update", actor_type="staff",
                    actor_user_id=staff.id, changed_fields={"image_added": image.id, "photo_type": photo_type},
                )
            db.commit()
            return image
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error in add_photo: {e}")
            raise

    @staticmethod
    def remove_photo(id: int, image_id: int, staff: User, db: Session) -> None:
        try:
            UploadService.remove_unit_photo(id, image_id, actor_user_id=staff.id, db=db)
            Audit.record(
                db, entity_type="unit", entity_id=id, action="update", actor_type="staff",
                actor_user_id=staff.id, changed_fields={"image_removed": image_id},
            )
            db.commit()
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error in remove_photo: {e}")
            raise

    @staticmethod
    def set_auction_sheet(id: int, *, content: bytes, content_type: Optional[str], staff: User, db: Session) -> UnitResponse:
        try:
            url = UploadService.attach_unit_auction_sheet(id, content=content, content_type=content_type, db=db)
            Audit.record(
                db, entity_type="unit", entity_id=id, action="update", actor_type="staff",
                actor_user_id=staff.id, changed_fields={"auction_sheet_url": url},
            )
            db.commit()
            unit = db.get(Unit, id)
            return StockService.get_by_slug(unit.slug, db)
        except HTTPException:
            db.rollback()
            raise
        except Exception as e:
            db.rollback()
            logger.error(f"Error in set_auction_sheet: {e}")
            raise
