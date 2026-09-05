# app/Models/magic_link_tokens.py

# magic_link_tokens (databaseschema.md §1).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, CheckConstraint, Index, func
from sqlalchemy.dialects.postgresql import INET

from app.Models.base import Base


class MagicLinkToken(Base):
    """Single-use passwordless login / email-verification tokens.

    No soft delete — lifecycle is fully described by expires_at / consumed_at.
    """

    __tablename__ = "magic_link_tokens"

    id = Column(BigInteger, primary_key=True)
    email = Column(Text, nullable=False)  # CITEXT at the DB level
    token_hash = Column(Text, nullable=False, unique=True)
    purpose = Column(Text, nullable=False)
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    consumed_at = Column(TIMESTAMP(timezone=True))
    ip_address = Column(INET)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    __table_args__ = (
        CheckConstraint("purpose IN ('login','verify_email')", name="ck_magic_link_tokens_purpose"),
        Index("idx_magic_link_tokens_email", "email", postgresql_where=consumed_at.is_(None)),
    )
