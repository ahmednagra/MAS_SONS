# app/Controllers/NotificationController.py
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.notification import NotificationListResponse, NotificationResponse
from app.Schemas.notification_preference import (
    NotificationPreferenceResponse, NotificationPreferenceUpdate,
)
from app.Services.NotificationPreferenceService import NotificationPreferenceService
from app.Services.Notifications.NotificationService import NotificationService
from app.Utils.Logger import logger


class NotificationController:
    @staticmethod
    def list_mine(user: User, cursor: Optional[int], limit: int, db: Session) -> NotificationListResponse:
        try:
            return NotificationService.list_mine(user, cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_mine: {e}")
            raise

    @staticmethod
    def mark_read(id: int, user: User, db: Session) -> NotificationResponse:
        try:
            return NotificationService.mark_read(id, user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in mark_read: {e}")
            raise

    @staticmethod
    def mark_all_read(user: User, db: Session) -> dict:
        try:
            NotificationService.mark_all_read(user, db)
            return {"message": "All notifications marked as read"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in mark_all_read: {e}")
            raise

    @staticmethod
    def get_preferences(user: User, db: Session) -> NotificationPreferenceResponse:
        try:
            return NotificationPreferenceService.get(user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_preferences: {e}")
            raise

    @staticmethod
    def update_preferences(user: User, data: NotificationPreferenceUpdate, db: Session) -> NotificationPreferenceResponse:
        try:
            return NotificationPreferenceService.update(user, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_preferences: {e}")
            raise
