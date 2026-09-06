# app/Services/Notifications/Channels/database_channel.py
# DatabaseChannel ("in_app") — persist a Notification row + push a real-time event (notificationssubsystem.md §1).
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.Models import Notification
from app.Services.Notifications.payload import NotificationPayload
from app.Services.Notifications.types import get_type_definition
from app.Utils.Results import OperationResult
from app.WebSocket.constants import STAFF_GLOBAL_CHANNEL, user_channel
from app.WebSocket.publisher import publish


class DatabaseChannel:
    name = "in_app"

    @staticmethod
    def deliver(payload: NotificationPayload, db: Session) -> OperationResult:
        if payload.recipient.user_id is None:
            return OperationResult(success=True, extra={"skipped": "guest_has_no_inbox"})

        type_def = get_type_definition(payload.notification_type)
        expires_at = None
        if type_def.get("retention_days"):
            expires_at = datetime.now(timezone.utc) + timedelta(days=type_def["retention_days"])

        row = Notification(
            recipient_type="staff" if type_def["applicable_recipient"] == "staff" else "user",
            recipient_id=payload.recipient.user_id,
            notification_type=payload.notification_type,
            category=type_def["category"], priority=type_def["priority"],
            title=payload.title, body=payload.body, action_url=payload.action_url,
            source_entity_type=payload.source_entity_type, source_entity_id=payload.source_entity_id,
            expires_at=expires_at,
        )
        db.add(row)
        db.commit()
        db.refresh(row)

        channel = STAFF_GLOBAL_CHANNEL if type_def["applicable_recipient"] == "staff" else user_channel(payload.recipient.user_id)
        realtime_result = publish(payload.notification_type, channel, {
            "id": row.id, "notification_type": row.notification_type, "title": row.title,
            "body": row.body, "action_url": row.action_url, "created_at": row.created_at.isoformat(),
        })
        return OperationResult(success=True, extra={"notification_id": row.id, "realtime": realtime_result.extra})
