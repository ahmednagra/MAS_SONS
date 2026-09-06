# app/Models/orders.py
# orders — converted quote/sourcing request (databaseschema.md §3).
from sqlalchemy import (
    Column, BigInteger, Text, Numeric, TIMESTAMP, ForeignKey, CheckConstraint, Index, func,
)
from sqlalchemy.dialects.postgresql import CITEXT
from sqlalchemy.orm import relationship

from app.Models.base import Base


class Order(Base):
    """A quote or sourcing request that converted into a real transaction — commercial terms, invoice, and shipment-milestone tracking."""

    __tablename__ = "orders"

    id = Column(BigInteger, primary_key=True)
    quote_request_id = Column(BigInteger, ForeignKey("quote_requests.id"))
    sourcing_request_id = Column(BigInteger, ForeignKey("sourcing_requests.id"))
    unit_id = Column(BigInteger, ForeignKey("units.id"), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id"))
    contact_name = Column(Text, nullable=False)
    contact_email = Column(CITEXT, nullable=False)
    final_price_usd = Column(Numeric(12, 2), nullable=False)
    incoterm = Column(Text, nullable=False)
    destination_country = Column(Text, ForeignKey("destinations.country_code"), nullable=False)
    invoice_number = Column(Text)
    payment_status = Column(Text, nullable=False, server_default="pending_invoice")
    shipping_status = Column(Text, nullable=False, server_default="pending")
    shipping_status_updated_at = Column(TIMESTAMP(timezone=True))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    quote_request = relationship("QuoteRequest")
    sourcing_request = relationship("SourcingRequest")
    unit = relationship("Unit")
    user = relationship("User", foreign_keys=[user_id])
    deleter = relationship("User", foreign_keys=[deleted_by])
    destination = relationship("Destination")
    fulfillment_details = relationship(
        "OrderFulfillmentDetail", back_populates="order", uselist=False
    )

    __table_args__ = (
        CheckConstraint("incoterm IN ('FOB','CFR','CIF')", name="ck_orders_incoterm"),
        CheckConstraint(
            "payment_status IN ('pending_invoice','invoiced','paid')", name="ck_orders_payment_status"
        ),
        CheckConstraint(
            "shipping_status IN "
            "('pending','booked','loaded','departed','arrived','customs_clearance','delivered')",
            name="ck_orders_shipping_status",
        ),
        CheckConstraint(
            "num_nonnulls(quote_request_id, sourcing_request_id) = 1",
            name="chk_orders_exactly_one_source",
        ),
        Index(
            "idx_orders_user", "user_id",
            postgresql_where=(user_id.isnot(None)) & (deleted_at.is_(None)),
        ),
        Index("idx_orders_unit", "unit_id"),
        Index(
            "uq_orders_quote_request", "quote_request_id", unique=True,
            postgresql_where=quote_request_id.isnot(None),
        ),
        Index(
            "uq_orders_sourcing_request", "sourcing_request_id", unique=True,
            postgresql_where=sourcing_request_id.isnot(None),
        ),
        Index(
            "uq_orders_invoice_number", "invoice_number", unique=True,
            postgresql_where=invoice_number.isnot(None),
        ),
        Index(
            "idx_orders_status", "payment_status", "shipping_status",
            postgresql_where=deleted_at.is_(None),
        ),
    )
