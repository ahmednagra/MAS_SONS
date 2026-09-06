# routes/api/v0/notifications.py
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.NotificationController import NotificationController
from app.Models import User
from app.Schemas.notification import NotificationListResponse, NotificationResponse
from app.Schemas.notification_preference import (
    NotificationPreferenceResponse, NotificationPreferenceUpdate,
)
from app.Utils.Helpers import get_current_user
from config.database import get_db

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=NotificationListResponse)
def list_notifications(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return NotificationController.list_mine(current_user, cursor, limit, db)


@router.post("/{id}/read", response_model=NotificationResponse)
def mark_notification_read(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return NotificationController.mark_read(id, current_user, db)


@router.post("/read-all")
def mark_all_notifications_read(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return NotificationController.mark_all_read(current_user, db)


@router.get("/preferences", response_model=NotificationPreferenceResponse)
def get_notification_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return NotificationController.get_preferences(current_user, db)


@router.patch("/preferences", response_model=NotificationPreferenceResponse)
def update_notification_preferences(
    data: NotificationPreferenceUpdate,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return NotificationController.update_preferences(current_user, data, db)
