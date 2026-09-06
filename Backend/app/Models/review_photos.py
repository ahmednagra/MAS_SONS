# app/Models/review_photos.py
# review_photos (databaseschema.md §5).
from sqlalchemy import Column, BigInteger, SmallInteger, Text, TIMESTAMP, ForeignKey, Index, func, text
from sqlalchemy.orm import relationship

from app.Models.base import Base


class ReviewPhoto(Base):
    """Photos attached to a buyer-submitted review."""

    __tablename__ = "review_photos"

    id = Column(BigInteger, primary_key=True)
    review_id = Column(BigInteger, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    sort_order = Column(SmallInteger, nullable=False, server_default=text("0"))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    review = relationship("Review", back_populates="photos")
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("idx_review_photos_review", "review_id", "sort_order"),
    )
