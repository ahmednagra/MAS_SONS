# app/Services/Notifications/Email/__init__.py

# Email subsystem package export surface.

from app.Services.Notifications.Email.EmailService import EmailService
from app.Services.Notifications.Email.EmailDispatcher import EmailDispatcher

__all__ = ["EmailService", "EmailDispatcher"]
