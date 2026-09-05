# app/Models/buyback_lead_photos.py

# buyback_lead_photos (databaseschema.md §3).
from sqlalchemy import Column, BigInteger, SmallInteger, Text, TIMESTAMP, ForeignKey, Index, func, text
from sqlalchemy.orm import relationship

from app.Models.base import Base


class BuybackLeadPhoto(Base):
    """Photos attached to a domestic buyback lead."""

    __tablename__ = "buyback_lead_photos"

    id = Column(BigInteger, primary_key=True)
    buyback_lead_id = Column(BigInteger, ForeignKey("buyback_leads.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    sort_order = Column(SmallInteger, nullable=False, server_default=text("0"))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    buyback_lead = relationship("BuybackLead", back_populates="photos")
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("idx_buyback_lead_photos_lead", "buyback_lead_id", "sort_order"),
    )
