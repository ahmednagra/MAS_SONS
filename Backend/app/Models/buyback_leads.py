# app/Models/buyback_leads.py

# buyback_leads — domestic sell-to-us leads (databaseschema.md §3).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class BuybackLead(Base):
    """Domestic seller-facing 'sell to us' leads — name, phone, description, photos;
    no account, no email. LINE/phone-first by design — not the GuestContact shape used
    by the two buyer-facing forms.
    """

    __tablename__ = "buyback_leads"

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    phone = Column(Text, nullable=False)
    vehicle_or_equipment_description = Column(Text, nullable=False)
    status = Column(Text, nullable=False, server_default="new")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    deleter = relationship("User", foreign_keys=[deleted_by])
    photos = relationship("BuybackLeadPhoto", back_populates="buyback_lead")

    __table_args__ = (
        CheckConstraint("status IN ('new','contacted','closed')", name="ck_buyback_leads_status"),
        Index("idx_buyback_leads_status", "status", "created_at"),
    )
