# app/Models/reviews.py

# reviews — buyer-submitted, quote-request-verified (databaseschema.md §5).
from sqlalchemy import Column, BigInteger, SmallInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class Review(Base):
    """Buyer-submitted, country-segmented testimonials tied to a real quote request
    (the verification anchor). `rating` is optional and secondary — a country-segmented
    written testimonial is the stronger trust signal in this business than a star average.
    """

    __tablename__ = "reviews"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    quote_request_id = Column(BigInteger, ForeignKey("quote_requests.id"))
    unit_id = Column(BigInteger, ForeignKey("units.id"))
    reviewer_name = Column(Text, nullable=False)
    destination_country = Column(Text, ForeignKey("destinations.country_code"))
    rating = Column(SmallInteger)
    body = Column(Text, nullable=False)
    status = Column(Text, nullable=False, server_default="pending")
    moderated_by_user_id = Column(BigInteger, ForeignKey("users.id"))
    moderated_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    quote_request = relationship("QuoteRequest")
    unit = relationship("Unit")
    destination = relationship("Destination")
    moderator = relationship("User", foreign_keys=[moderated_by_user_id])
    deleter = relationship("User", foreign_keys=[deleted_by])
    photos = relationship("ReviewPhoto", back_populates="review")
    reports = relationship("ReviewReport", back_populates="review")

    __table_args__ = (
        CheckConstraint("status IN ('pending','approved','rejected')", name="ck_reviews_status"),
        CheckConstraint("rating IS NULL OR rating BETWEEN 1 AND 5", name="chk_reviews_rating_range"),
        Index("idx_reviews_status", "status", "created_at"),
        Index("idx_reviews_country", "destination_country", postgresql_where=(status == "approved")),
    )
