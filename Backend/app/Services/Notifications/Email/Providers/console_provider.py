# app/Services/Notifications/Email/Providers/console_provider.py
# Dev/no-op provider — logs the email instead of sending it.
import uuid

from app.Services.Notifications.Email.Providers.base_provider import BaseEmailProvider, EmailMessage
from app.Utils.Logger import logger
from app.Utils.Results import OperationResult


class ConsoleEmailProvider(BaseEmailProvider):
    name = "console"

    def is_configured(self) -> bool:
        return True

    def send(self, message: EmailMessage) -> OperationResult:
        message_id = f"console-{uuid.uuid4().hex[:12]}"
        logger.info(
            f"[console email] to={message.to_email} subject={message.subject!r} "
            f"template={message.template_name} id={message_id}\n{message.text_body}"
        )
        return OperationResult(success=True, extra={"provider_message_id": message_id})
