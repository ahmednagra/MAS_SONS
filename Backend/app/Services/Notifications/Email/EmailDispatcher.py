# app/Services/Notifications/Email/EmailDispatcher.py
# Retry/failover orchestration; never raises (emailsubsystem.md §3).
from typing import Literal

from sqlalchemy.orm import Session

from app.Models import EmailLog
from app.Services.Notifications.Email.Providers import get_email_provider
from app.Services.Notifications.Email.Providers.base_provider import EmailMessage
from app.Utils.Logger import logger
from app.Utils.Results import OperationResult
from app.Utils.Retry import retry_with_backoff

_PERMANENT_ERRORS = (ValueError,)


def _classify(e: Exception) -> Literal["permanent", "transient"]:
    return "permanent" if isinstance(e, _PERMANENT_ERRORS) else "transient"


class EmailDispatcher:
    @staticmethod
    def dispatch(message: EmailMessage, db: Session, *, user_id: int | None = None, extra: dict | None = None) -> OperationResult:
        provider = get_email_provider()
        log_row = EmailLog(
            user_id=user_id, to_email=message.to_email, template_name=message.template_name,
            subject=message.subject, provider=provider.name, status="queued", attempts=0,
            extra=extra or {},
        )
        db.add(log_row)
        db.commit()

        log_row.status = "sending"
        db.commit()

        result = retry_with_backoff(lambda: provider.send(message), classify=_classify)

        log_row.attempts = result.attempts
        if result.success:
            log_row.status = "sent"
            log_row.provider_message_id = result.extra.get("provider_message_id")
        else:
            log_row.status = "failed"
            log_row.error_code = result.error_code
            log_row.error_message = result.error_message
            logger.error(f"Email send failed to {message.to_email} ({message.template_name}): {result.error_message}")
        db.commit()

        return result
