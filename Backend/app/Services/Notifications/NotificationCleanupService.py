# app/Services/Notifications/NotificationCleanupService.py
# Retention purge (notificationssubsystem.md §6) — batched deletes for terminal rows within a still-current partition; rows old enough to fall in a…
from sqlalchemy import delete, func, select, tuple_
from sqlalchemy.orm import Session

from app.Models import Notification

BATCH_SIZE = 5000


class NotificationCleanupService:
    @staticmethod
    def purge_expired(db: Session) -> int:
        total_deleted = 0
        while True:
            rows = db.execute(
                select(Notification.id, Notification.created_at).where(
                    Notification.status.in_(["read", "archived"]),
                    Notification.expires_at.isnot(None),
                    Notification.expires_at < func.now(),
                ).limit(BATCH_SIZE)
            ).all()
            if not rows:
                break
            db.execute(delete(Notification).where(tuple_(Notification.id, Notification.created_at).in_(rows)))
            db.commit()
            total_deleted += len(rows)
            if len(rows) < BATCH_SIZE:
                break
        return total_deleted
