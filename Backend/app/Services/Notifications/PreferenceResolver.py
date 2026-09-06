# app/Services/Notifications/PreferenceResolver.py
# Channel preference resolution (notificationssubsystem.md §4).
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import NotificationPreference, User


class PreferenceResolver:
    @staticmethod
    def resolve_channels(
        user: Optional[User], notification_type: str, default_channels: set[str], db: Session,
    ) -> set[str]:
        if user is None:
            return set(default_channels)

        pref = db.execute(select(NotificationPreference).where(NotificationPreference.user_id == user.id)).scalars().first()
        if pref is None:
            return set(default_channels)

        channels = set(default_channels)
        if pref.is_email_paused:
            channels.discard("email")

        type_override = (pref.channel_preferences or {}).get(notification_type)
        if isinstance(type_override, list):
            channels &= set(type_override)
        return channels
