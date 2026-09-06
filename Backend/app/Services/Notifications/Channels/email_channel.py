# app/Services/Notifications/Channels/email_channel.py
# EmailChannel — delegates to EmailService.send_template_in_background() (notificationssubsystem.md §1).
from fastapi import BackgroundTasks

from app.Services.Notifications.Email.EmailService import EmailService
from app.Services.Notifications.payload import NotificationPayload
from app.Services.Notifications.types import get_type_definition
from app.Utils.Results import OperationResult


class EmailChannel:
    name = "email"

    @staticmethod
    def deliver(payload: NotificationPayload, background_tasks: BackgroundTasks) -> OperationResult:
        if not payload.recipient.email:
            return OperationResult(success=False, error_code="no_email")

        template = get_type_definition(payload.notification_type).get("email_template")
        if not template:
            return OperationResult(success=True, extra={"skipped": "no_template"})

        EmailService.send_template_in_background(
            background_tasks, to_email=payload.recipient.email, template_name=template,
            subject=payload.title, context=payload.email_context, user_id=payload.recipient.user_id,
        )
        return OperationResult(success=True)
