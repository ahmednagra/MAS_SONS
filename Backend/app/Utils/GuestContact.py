# app/Utils/GuestContact.py
# GuestContact — shared shape for a recipient with no account (sharedinfrastructure.md §5).
from dataclasses import dataclass
from typing import Optional


@dataclass
class GuestContact:
    name: str
    email: Optional[str]
    whatsapp: Optional[str]
    user_id: Optional[int] = None

    def is_guest(self) -> bool:
        return self.user_id is None
