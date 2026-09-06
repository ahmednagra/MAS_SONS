# app/Services/NotificationPreferenceService.py
# Per-user notification channel preferences, created lazily on first read.
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import NotificationPreference, User
from app.Schemas.notification_preference import (
    NotificationPreferenceResponse, NotificationPreferenceUpdate,
)


class NotificationPreferenceService:
    @staticmethod
    def _get_or_create(user: User, db: Session) -> NotificationPreference:
        row = db.execute(
            select(NotificationPreference).where(NotificationPreference.user_id == user.id)
        ).scalars().first()
        if row is None:
            row = NotificationPreference(user_id=user.id, channel_preferences={})
            db.add(row)
            db.commit()
            db.refresh(row)
        return row

    @staticmethod
    def get(user: User, db: Session) -> NotificationPreferenceResponse:
        return NotificationPreferenceResponse.model_validate(NotificationPreferenceService._get_or_create(user, db))

    @staticmethod
    def update(user: User, data: NotificationPreferenceUpdate, db: Session) -> NotificationPreferenceResponse:
        row = NotificationPreferenceService._get_or_create(user, db)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(row, field, value)
        db.commit()
        db.refresh(row)
        return NotificationPreferenceResponse.model_validate(row)
