# app/Models/saved_searches.py

# saved_searches (databaseschema.md §4).
from sqlalchemy import Column, BigInteger, Text, Boolean, TIMESTAMP, ForeignKey, Index, func, text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship

from app.Models.base import Base


class SavedSearch(Base):
    """A buyer's saved filter set with new-stock alerting. `filters` is JSONB mirroring
    StockSearchParams as-is — a new filter field never needs a migration here.
    """

    __tablename__ = "saved_searches"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    name = Column(Text)
    filters = Column(JSONB, nullable=False)
    alert_enabled = Column(Boolean, nullable=False, server_default=text("true"))
    last_notified_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("idx_saved_searches_alerts", "alert_enabled", postgresql_where=alert_enabled.is_(True)),
    )
