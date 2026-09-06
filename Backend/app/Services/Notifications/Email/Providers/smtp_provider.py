# app/Services/Notifications/Email/Providers/smtp_provider.py
# Generic SMTP provider — works with any SMTP-compatible relay (a real vendor's SMTP endpoint, Gmail SMTP, etc.) without a vendor-specific SDK…
import smtplib
import uuid
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from app.Services.Notifications.Email.Providers.base_provider import BaseEmailProvider, EmailMessage
from app.Utils.Results import OperationResult
from config.settings import settings


class SMTPProvider(BaseEmailProvider):
    name = "smtp"

    def is_configured(self) -> bool:
        return bool(settings.SMTP_HOST)

    def send(self, message: EmailMessage) -> OperationResult:
        mime_message = MIMEMultipart("alternative")
        mime_message["Subject"] = message.subject
        mime_message["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM_ADDRESS}>"
        mime_message["To"] = message.to_email
        mime_message.attach(MIMEText(message.text_body, "plain"))
        mime_message.attach(MIMEText(message.html_body, "html"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10) as client:
            if settings.SMTP_USE_TLS:
                client.starttls()
            if settings.SMTP_USERNAME:
                client.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD or "")
            client.sendmail(settings.EMAIL_FROM_ADDRESS, [message.to_email], mime_message.as_string())

        return OperationResult(success=True, extra={"provider_message_id": f"smtp-{uuid.uuid4().hex[:12]}"})
