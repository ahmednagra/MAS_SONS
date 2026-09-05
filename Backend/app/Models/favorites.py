# app/Models/favorites.py

# favorites (databaseschema.md §4).
from sqlalchemy import Column, BigInteger, TIMESTAMP, ForeignKey, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class Favorite(Base):
    """A buyer's saved/favorited units.

    UNIQUE(user_id, unit_id) is table-wide, not partial on deleted_at — re-favoriting
    after an unfavorite restores the existing soft-deleted row rather than inserting
    a new one.
    """

    __tablename__ = "favorites"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    unit_id = Column(BigInteger, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    unit = relationship("Unit")
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("idx_favorites_user", "user_id", "created_at"),
        Index("uq_favorites_user_unit", "user_id", "unit_id", unique=True),
    )
