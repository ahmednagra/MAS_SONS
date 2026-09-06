# app/Services/Notifications/payload.py
# NotificationPayload — one shape carried through RecipientResolver, PreferenceResolver and every Channel, instead of a long positional-argument chain.
from dataclasses import dataclass, field
from typing import Any, Optional

from app.Utils.GuestContact import GuestContact


@dataclass
class NotificationPayload:
    notification_type: str
    recipient: GuestContact
    title: str
    body: str
    action_url: Optional[str] = None
    source_entity_type: Optional[str] = None
    source_entity_id: Optional[int] = None
    email_context: dict[str, Any] = field(default_factory=dict)
