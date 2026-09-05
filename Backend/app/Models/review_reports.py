# app/Models/review_reports.py

# review_reports — abuse/moderation reports (databaseschema.md §5).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, Index, func
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import relationship

from app.Models.base import Base


class ReviewReport(Base):
    """Abuse/moderation reports against a published review. A report never auto-hides
    the review — only staff acting on it (setting reviews.status = 'rejected') does.
    """

    __tablename__ = "review_reports"

    id = Column(BigInteger, primary_key=True)
    review_id = Column(BigInteger, ForeignKey("reviews.id", ondelete="CASCADE"), nullable=False)
    reporter_email = Column(CITEXT)
    reason = Column(Text, nullable=False)
    resolved_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    review = relationship("Review", back_populates="reports")
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("idx_review_reports_unresolved", "review_id", postgresql_where=resolved_at.is_(None)),
    )
