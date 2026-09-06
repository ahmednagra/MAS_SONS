# app/Models/websocket_connection_log.py
# websocket_connection_log — connection audit trail (databaseschema.md §8).
from sqlalchemy import (
    Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Identity, Index,
    PrimaryKeyConstraint, func,
)
from sqlalchemy.dialects.postgresql import INET, UUID
from sqlalchemy.orm import relationship

from app.Models.base import Base


class WebSocketConnectionLog(Base):
    """Audit trail of real-time connection activity — debugging and security review, not the live connection registry (that stays in-memory + Redis)."""

    __tablename__ = "websocket_connection_log"

    id = Column(BigInteger, Identity(), nullable=False)
    connection_id = Column(UUID(as_uuid=True), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    role = Column(Text, nullable=False)
    connected_at = Column(TIMESTAMP(timezone=True), nullable=False)
    disconnected_at = Column(TIMESTAMP(timezone=True))
    disconnect_reason = Column(Text)
    ip_address = Column(INET)
    instance_id = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", foreign_keys=[user_id])

    __table_args__ = (
        PrimaryKeyConstraint("id", "created_at"),
        CheckConstraint("role IN ('buyer','staff')", name="ck_websocket_connection_log_role"),
        CheckConstraint(
            "disconnect_reason IN ('client_close','idle_timeout','server_shutdown','error')",
            name="ck_websocket_connection_log_disconnect_reason",
        ),
        Index("idx_ws_log_user", "user_id", "connected_at"),
        Index("idx_ws_log_open", "connection_id", postgresql_where=disconnected_at.is_(None)),
        {"postgresql_partition_by": "RANGE (created_at)"},
    )
