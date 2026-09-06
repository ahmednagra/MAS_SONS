# app/Controllers/ReviewController.py
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.review import (
    ReviewCreate, ReviewModerate, ReviewReportCreate, ReviewReportResponse, ReviewResponse,
)
from app.Services.ReviewService import ReviewService
from app.Utils.Logger import logger


class ReviewController:
    @staticmethod
    def create(data: ReviewCreate, user: Optional[User], db: Session) -> ReviewResponse:
        try:
            return ReviewService.create(data, user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create: {e}")
            raise

    @staticmethod
    def list_approved(country: Optional[str], cursor: Optional[int], limit: int, db: Session) -> list[ReviewResponse]:
        try:
            return ReviewService.list_approved(country, cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_approved: {e}")
            raise

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
            return ReviewService.moderate(id, data, staff, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in moderate: {e}")
            raise

    @staticmethod
    def report(review_id: int, data: ReviewReportCreate, db: Session) -> ReviewReportResponse:
        try:
            return ReviewService.report(review_id, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in report: {e}")
            raise
