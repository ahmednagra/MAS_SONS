# app/Models/notifications.py

# notifications (databaseschema.md §6, notificationssubsystem.md §6).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class Notification(Base):
    """Fan-out-on-write in-app/email dispatch record, one row per recipient per
    notification event. No soft delete — an event projection, hard-deleted by
    retention. PARTITION BY RANGE (created_at) at the DB level — a migration/DDL
    concern, not something the ORM model itself needs to express.
    """

    __tablename__ = "notifications"

    id = Column(BigInteger, primary_key=True)
    recipient_type = Column(Text, nullable=False)
    recipient_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    notification_type = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    priority = Column(Text, nullable=False)
    title = Column(Text, nullable=False)
    body = Column(Text, nullable=False)
    action_url = Column(Text)
    source_entity_type = Column(Text)  # polymorphic, no FK — see databaseschema.md Conventions
    source_entity_id = Column(BigInteger)
    status = Column(Text, nullable=False, server_default="unread")
    read_at = Column(TIMESTAMP(timezone=True))
    expires_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    recipient = relationship("User", foreign_keys=[recipient_id])

    __table_args__ = (
        CheckConstraint("recipient_type IN ('user','staff')", name="ck_notifications_recipient_type"),
        CheckConstraint("priority IN ('low','normal','high','critical')", name="ck_notifications_priority"),
        CheckConstraint("status IN ('unread','read','archived')", name="ck_notifications_status"),
        Index("idx_notifications_recipient_status", "recipient_id", "status", "created_at"),
        Index("idx_notifications_expires", "expires_at", postgresql_where=expires_at.isnot(None)),
    )
