# app/Models/sourcing_requests.py

# sourcing_requests — 'Request a Car' (databaseschema.md §3).
from sqlalchemy import Column, BigInteger, Text, Numeric, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import relationship

from app.Models.base import Base


class SourcingRequest(Base):
    """'Request a Car' — buyer describes what they want when nothing in stock matches;
    staff sources it via auction. Deliberately not a nullable-unit_id row in
    quote_requests — a sourcing request has no unit to point at.
    """

    __tablename__ = "sourcing_requests"

    id = Column(BigInteger, primary_key=True)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    contact_name = Column(Text, nullable=False)
    contact_email = Column(CITEXT, nullable=False)
    contact_whatsapp = Column(Text)
    make = Column(Text)
    model_description = Column(Text, nullable=False)
    min_auction_grade = Column(Text)
    budget_max_usd = Column(Numeric(12, 2))
    destination_country = Column(Text, ForeignKey("destinations.country_code"))
    quote_type = Column(Text)
    buying_timeframe = Column(Text)
    status = Column(Text, nullable=False, server_default="pending")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    user = relationship("User", foreign_keys=[user_id])
    deleter = relationship("User", foreign_keys=[deleted_by])
    destination = relationship("Destination")

    __table_args__ = (
        CheckConstraint(
            "min_auction_grade IN ('5','4.5','4','3.5','3','R','RA')",
            name="ck_sourcing_requests_min_auction_grade",
        ),
        CheckConstraint("quote_type IN ('FOB','CFR','CIF')", name="ck_sourcing_requests_quote_type"),
        CheckConstraint(
            "status IN ('pending','sourcing','found','closed')", name="ck_sourcing_requests_status"
        ),
        Index("idx_sourcing_requests_status", "status", "created_at", postgresql_where=deleted_at.is_(None)),
        Index(
            "idx_sourcing_requests_user", "user_id",
            postgresql_where=(user_id.isnot(None)) & (deleted_at.is_(None)),
        ),
    )
