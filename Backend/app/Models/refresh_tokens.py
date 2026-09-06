# app/Models/refresh_tokens.py
# refresh_tokens (databaseschema.md §1).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import relationship

from app.Models.base import Base


class RefreshToken(Base):
    """Rotating refresh tokens with reuse detection (token-family revocation)."""

    __tablename__ = "refresh_tokens"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = Column(Text, nullable=False, unique=True)
    family_id = Column(UUID(as_uuid=True), nullable=False)
    replaced_by_id = Column(BigInteger, ForeignKey("refresh_tokens.id"))
    expires_at = Column(TIMESTAMP(timezone=True), nullable=False)
    revoked_at = Column(TIMESTAMP(timezone=True))
    user_agent = Column(Text)
    ip_address = Column(INET)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])
    replaced_by = relationship("RefreshToken", remote_side=[id], foreign_keys=[replaced_by_id])

    __table_args__ = (
        Index("idx_refresh_tokens_user", "user_id", postgresql_where=revoked_at.is_(None)),
        Index("idx_refresh_tokens_family", "family_id"),
    )
