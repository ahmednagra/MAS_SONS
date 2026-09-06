# app/Controllers/admin/AdminReviewController.py
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.review import ReviewModerate, ReviewResponse
from app.Services.ReviewService import ReviewService
from app.Utils import Audit
from app.Utils.Logger import logger


class AdminReviewController:
    @staticmethod
    def list_pending(cursor: Optional[int], limit: int, db: Session) -> list[ReviewResponse]:
        try:
            return ReviewService.list_pending(cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_pending: {e}")
            raise

    @staticmethod
    def moderate(id: int, data: ReviewModerate, staff: User, db: Session) -> ReviewResponse:
        try:
            response = ReviewService.moderate(id, data, staff, db)
            Audit.record(
                db, entity_type="review", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id, changed_fields={"status": response.status},
            )
            db.commit()
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in moderate: {e}")
            raise
