# config/email.py
# Email provider selection (emailsubsystem.md §2).
from config.settings import settings


def get_email_provider_name() -> str:
    return settings.EMAIL_PROVIDER
