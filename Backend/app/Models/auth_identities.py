# app/Models/auth_identities.py
# auth_identities (databaseschema.md §1).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class AuthIdentity(Base):
    """One row per sign-in method (password / Google / magic link) linked to a user."""

    __tablename__ = "auth_identities"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    provider = Column(Text, nullable=False)
    provider_subject = Column(Text)
    password_hash = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    last_used_at = Column(TIMESTAMP(timezone=True))
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        CheckConstraint("provider IN ('password','google','magic_link')", name="ck_auth_identities_provider"),
        CheckConstraint(
            "(provider = 'password' AND password_hash IS NOT NULL) OR "
            "(provider != 'password' AND password_hash IS NULL)",
            name="chk_auth_identities_password_hash_only_for_password",
        ),
        Index(
            "idx_auth_identities_google_subject", "provider_subject", unique=True,
            postgresql_where=(provider == "google"),
        ),
        Index("uq_auth_identities_user_provider", "user_id", "provider", unique=True),
    )
