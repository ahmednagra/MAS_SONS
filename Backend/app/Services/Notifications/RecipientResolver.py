# app/Services/Notifications/RecipientResolver.py
# Recipient resolution — one of exactly two shapes in a single-company system (notificationssubsystem.md §2).
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import User
from app.Utils.GuestContact import GuestContact


class RecipientResolver:
    @staticmethod
    def buyer_contact(
        *, user_id: Optional[int], contact_name: str, contact_email: Optional[str],
        contact_whatsapp: Optional[str] = None,
    ) -> GuestContact:
        return GuestContact(name=contact_name, email=contact_email, whatsapp=contact_whatsapp, user_id=user_id)

    @staticmethod
    def staff(db: Session) -> Sequence[User]:
        return db.execute(
            select(User).where(User.user_type == "staff", User.status == "active", User.deleted_at.is_(None))
        ).scalars().all()
