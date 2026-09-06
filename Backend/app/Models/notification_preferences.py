# app/Models/notification_preferences.py
# notification_preferences (databaseschema.md §6, notificationssubsystem.md §6).
from sqlalchemy import Column, BigInteger, Text, Boolean, Time, TIMESTAMP, ForeignKey, CheckConstraint, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.Models.base import Base


class NotificationPreference(Base):
    """Per-user channel/quiet-hours/digest preferences."""

    __tablename__ = "notification_preferences"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    channel_preferences = Column(JSONB, nullable=False, server_default="{}")
    is_email_paused = Column(Boolean, nullable=False, server_default=text("false"))
    marketing_opt_in = Column(Boolean, nullable=False, server_default=text("false"))
    quiet_hours_start = Column(Time)
    quiet_hours_end = Column(Time)
    timezone = Column(Text, nullable=False, server_default="UTC")
    digest_frequency = Column(Text, nullable=False, server_default="realtime")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        CheckConstraint(
            "digest_frequency IN ('realtime','daily','weekly','never')",
            name="ck_notification_preferences_digest_frequency",
        ),
    )
