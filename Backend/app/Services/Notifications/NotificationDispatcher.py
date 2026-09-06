# app/Services/Notifications/NotificationDispatcher.py
# dispatch() — the core routing step (notificationssubsystem.md §1): resolve channels, hand the payload to each enabled Channel.
from typing import Optional

from fastapi import BackgroundTasks
from sqlalchemy.orm import Session

from app.Models import User
from app.Services.Notifications.Channels.database_channel import DatabaseChannel
from app.Services.Notifications.Channels.email_channel import EmailChannel
from app.Services.Notifications.PreferenceResolver import PreferenceResolver
from app.Services.Notifications.payload import NotificationPayload
from app.Services.Notifications.types import get_type_definition, is_known_type
from app.Utils.Idempotency import check_and_mark
from app.Utils.Logger import logger

DISPATCH_IDEMPOTENCY_TTL_SECONDS = 300


class NotificationDispatcher:
    @staticmethod
    def dispatch(
        payload: NotificationPayload, db: Session, background_tasks: BackgroundTasks, *,
        recipient_user: Optional[User] = None,
    ) -> None:
        if not is_known_type(payload.notification_type):
            logger.error(f"Unknown notification type: {payload.notification_type}")
            return

        recipient_key = payload.recipient.user_id or payload.recipient.email or "unknown"
        idempotency_key = f"notify:{payload.notification_type}:{payload.source_entity_type}:{payload.source_entity_id}:{recipient_key}"
        if not check_and_mark(idempotency_key, DISPATCH_IDEMPOTENCY_TTL_SECONDS):
            logger.info(f"Notification dispatch deduped: {idempotency_key}")
            return

        type_def = get_type_definition(payload.notification_type)
        channels = PreferenceResolver.resolve_channels(recipient_user, payload.notification_type, set(type_def["default_channels"]), db)

        if "in_app" in channels:
            result = DatabaseChannel.deliver(payload, db)
            if not result.success:
                logger.warning(f"in_app delivery failed for {payload.notification_type}: {result.error_message}")
        if "email" in channels:
            result = EmailChannel.deliver(payload, background_tasks)
            if not result.success:
                logger.warning(f"email delivery failed for {payload.notification_type}: {result.error_message}")
