# app/Services/Notifications/NotificationService.py
from datetime import datetime, timezone
from typing import Optional

from fastapi import BackgroundTasks, HTTPException, status
from sqlalchemy import func, select, update
from sqlalchemy.orm import Session

from app.Models import Notification, User
from app.Schemas.notification import NotificationListResponse, NotificationResponse
from app.Services.Notifications.NotificationDispatcher import NotificationDispatcher
from app.Services.Notifications.RecipientResolver import RecipientResolver
from app.Services.Notifications.payload import NotificationPayload
from app.Utils.GuestContact import GuestContact


class NotificationService:
    @staticmethod
    def list_mine(user: User, cursor: Optional[int], limit: int, db: Session) -> NotificationListResponse:
        stmt = select(Notification).where(Notification.recipient_id == user.id)
        if cursor is not None:
            stmt = stmt.where(Notification.id < cursor)
        stmt = stmt.order_by(Notification.id.desc()).limit(limit + 1)
        rows = db.execute(stmt).scalars().all()
        has_more = len(rows) > limit
        page = rows[:limit]

        unread_count = db.execute(
            select(func.count()).select_from(Notification).where(
                Notification.recipient_id == user.id, Notification.status == "unread"
            )
        ).scalar_one()

        return NotificationListResponse(
            items=[NotificationResponse.model_validate(r) for r in page],
            unread_count=unread_count,
            next_cursor=page[-1].id if has_more and page else None,
        )

    @staticmethod
    def mark_read(id: int, user: User, db: Session) -> NotificationResponse:
        # Composite PK (id, created_at) on the partitioned table, so a filtered query rather than db.get().
        row = db.execute(select(Notification).where(Notification.id == id)).scalars().first()
        if row is None or row.recipient_id != user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
        if row.status == "unread":
            row.status = "read"
            row.read_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(row)
        return NotificationResponse.model_validate(row)

    @staticmethod
    def mark_all_read(user: User, db: Session) -> None:
        db.execute(
            update(Notification)
            .where(Notification.recipient_id == user.id, Notification.status == "unread")
            .values(status="read", read_at=datetime.now(timezone.utc))
        )
        db.commit()

    @staticmethod
    def notify_staff(
        notification_type: str, *, title: str, body: str, email_context: dict,
        action_url: Optional[str] = None, source_entity_type: Optional[str] = None,
        source_entity_id: Optional[int] = None, db: Session, background_tasks: BackgroundTasks,
    ) -> None:
        for staff in RecipientResolver.staff(db):
            payload = NotificationPayload(
                notification_type=notification_type,
                recipient=GuestContact(name=staff.full_name, email=staff.email, whatsapp=None, user_id=staff.id),
                title=title, body=body, action_url=action_url,
                source_entity_type=source_entity_type, source_entity_id=source_entity_id,
                email_context=email_context,
            )
            NotificationDispatcher.dispatch(payload, db, background_tasks, recipient_user=staff)

    @staticmethod
    def notify_buyer(
        notification_type: str, *, recipient: GuestContact, title: str, body: str, email_context: dict,
        action_url: Optional[str] = None, source_entity_type: Optional[str] = None,
        source_entity_id: Optional[int] = None, recipient_user: Optional[User] = None,
        db: Session, background_tasks: BackgroundTasks,
    ) -> None:
        payload = NotificationPayload(
            notification_type=notification_type, recipient=recipient, title=title, body=body,
            action_url=action_url, source_entity_type=source_entity_type, source_entity_id=source_entity_id,
            email_context=email_context,
        )
        NotificationDispatcher.dispatch(payload, db, background_tasks, recipient_user=recipient_user)
