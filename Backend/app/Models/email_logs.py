# app/Models/email_logs.py
# email_logs (databaseschema.md §7, emailsubsystem.md §5).
from sqlalchemy import (
    Column, BigInteger, SmallInteger, Text, TIMESTAMP, ForeignKey, Identity, Index,
    PrimaryKeyConstraint, func, text,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.Models.base import Base


class EmailLog(Base):
    """One row per outbound email send attempt, mutated in place (queued -> sending -> sent/failed/retrying)."""

    __tablename__ = "email_logs"

    id = Column(BigInteger, Identity(), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    to_email = Column(Text, nullable=False)
    template_name = Column(Text, nullable=False)
    subject = Column(Text, nullable=False)
    provider = Column(Text, nullable=False)
    status = Column(Text, nullable=False)
    provider_message_id = Column(Text)
    error_code = Column(Text)
    error_message = Column(Text)
    attempts = Column(SmallInteger, nullable=False, server_default=text("0"))
    extra = Column(JSONB, nullable=False, server_default="{}")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        PrimaryKeyConstraint("id", "created_at"),
        Index("idx_email_logs_to_email", "to_email"),
        Index(
            "idx_email_logs_status", "status",
            postgresql_where=status.in_(["queued", "retrying"]),
        ),
        Index("idx_email_logs_user_created", "user_id", "created_at"),
        Index("idx_email_logs_extra_gin", "extra", postgresql_using="gin"),
        {"postgresql_partition_by": "RANGE (created_at)"},
    )
