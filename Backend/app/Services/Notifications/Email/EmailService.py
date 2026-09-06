# app/Services/Notifications/Email/EmailService.py
# Email facade — entrypoint from request handlers (emailsubsystem.md §1).
from typing import Optional

from fastapi import BackgroundTasks

from app.Services.Notifications.Email.EmailDispatcher import EmailDispatcher
from app.Services.Notifications.Email.Providers.base_provider import EmailMessage
from app.Services.Notifications.Email.TemplateRenderer import TemplateRenderer
from app.Utils.Logger import logger
from app.Utils.RateLimiter import check_and_increment
from app.Utils.Results import OperationResult
from config.database import SessionLocal
from config.settings import settings


class EmailService:
    @staticmethod
    def send_template_in_background(
        background_tasks: BackgroundTasks, *, to_email: str, template_name: str, subject: str,
        context: dict, user_id: Optional[int] = None, extra: Optional[dict] = None,
    ) -> None:
        background_tasks.add_task(
            EmailService._send_now, to_email, template_name, subject, context, user_id, extra or {},
        )

    @staticmethod
    def _send_now(
        to_email: str, template_name: str, subject: str, context: dict,
        user_id: Optional[int], extra: dict,
    ) -> OperationResult:
        if not check_and_increment(f"email:send:{to_email}", 3600, settings.EMAIL_MAX_PER_RECIPIENT_PER_HOUR):
            logger.warning(f"Email rate-limited for {to_email} (template={template_name})")
            return OperationResult(success=False, error_code="rate_limited")

        db = SessionLocal()
        try:
            html_body, text_body = TemplateRenderer.render(template_name, context)
            message = EmailMessage(
                to_email=to_email, subject=subject, html_body=html_body, text_body=text_body,
                template_name=template_name,
            )
            return EmailDispatcher.dispatch(message, db, user_id=user_id, extra=extra)
        except Exception as e:
            logger.error(f"EmailService failed to send {template_name} to {to_email}: {e}")
            return OperationResult(success=False, error_code="render_or_dispatch_error", error_message=str(e))
        finally:
            db.close()
