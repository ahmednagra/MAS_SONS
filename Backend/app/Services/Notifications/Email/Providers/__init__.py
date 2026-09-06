# app/Services/Notifications/Email/Providers/__init__.py
# Factory/registry seam (emailsubsystem.md §2) — adding a real backup provider later is one new class plus one registry line, never a call-site rewrite.
from app.Services.Notifications.Email.Providers.base_provider import BaseEmailProvider
from app.Services.Notifications.Email.Providers.console_provider import ConsoleEmailProvider
from app.Services.Notifications.Email.Providers.smtp_provider import SMTPProvider

_REGISTRY: dict[str, type[BaseEmailProvider]] = {
    "console": ConsoleEmailProvider,
    "smtp": SMTPProvider,
}


def get_email_provider() -> BaseEmailProvider:
    from config.email import get_email_provider_name

    provider_cls = _REGISTRY.get(get_email_provider_name(), ConsoleEmailProvider)
    provider = provider_cls()
    return provider if provider.is_configured() else ConsoleEmailProvider()
