# app/Models/quote_requests.py
# quote_requests — 'Get a Quote' (databaseschema.md §3).
from sqlalchemy import Column, BigInteger, Text, Numeric, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import relationship

from app.Models.base import Base


class QuoteRequest(Base):
    """'Get a Quote' — a buyer or guest asks for a delivered price on a specific unit."""

    __tablename__ = "quote_requests"

    id = Column(BigInteger, primary_key=True)
    unit_id = Column(BigInteger, ForeignKey("units.id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    contact_name = Column(Text, nullable=False)
    contact_email = Column(CITEXT, nullable=False)
    contact_whatsapp = Column(Text)
    destination_country = Column(Text, ForeignKey("destinations.country_code"), nullable=False)
    incoterm = Column(Text, nullable=False)
    status = Column(Text, nullable=False, server_default="pending")
    quoted_price_usd = Column(Numeric(12, 2))
    quoted_at = Column(TIMESTAMP(timezone=True))
    notes = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    unit = relationship("Unit")
    user = relationship("User", foreign_keys=[user_id])
    deleter = relationship("User", foreign_keys=[deleted_by])
    destination = relationship("Destination")

    __table_args__ = (
        CheckConstraint("incoterm IN ('FOB','CFR','CIF')", name="ck_quote_requests_incoterm"),
        CheckConstraint("status IN ('pending','quoted','closed')", name="ck_quote_requests_status"),
        Index("idx_quote_requests_unit", "unit_id", postgresql_where=deleted_at.is_(None)),
        Index(
            "idx_quote_requests_user", "user_id",
            postgresql_where=(user_id.isnot(None)) & (deleted_at.is_(None)),
        ),
        Index("idx_quote_requests_status", "status", "created_at", postgresql_where=deleted_at.is_(None)),
    )
