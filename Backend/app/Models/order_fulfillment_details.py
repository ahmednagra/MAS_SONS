# app/Models/order_fulfillment_details.py
# order_fulfillment_details — shipping/identity, collected at order time only (databaseschema.md §3).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class OrderFulfillmentDetail(Base):
    """Shipping address and identity-verification record, collected only once an order is actually placed."""

    __tablename__ = "order_fulfillment_details"

    id = Column(BigInteger, primary_key=True)
    order_id = Column(BigInteger, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    consignee_name = Column(Text, nullable=False)
    consignee_phone = Column(Text, nullable=False)
    shipping_address_line1 = Column(Text, nullable=False)
    shipping_address_line2 = Column(Text)
    shipping_city = Column(Text, nullable=False)
    shipping_state_province = Column(Text)
    shipping_postal_code = Column(Text)
    identity_document_type = Column(Text)
    identity_document_url = Column(Text)
    identity_verified_at = Column(TIMESTAMP(timezone=True))
    identity_verified_by = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    order = relationship("Order", back_populates="fulfillment_details")
    verifier = relationship("User", foreign_keys=[identity_verified_by])
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        CheckConstraint(
            "identity_document_type IN ('passport','national_id','driver_license')",
            name="ck_order_fulfillment_details_identity_document_type",
        ),
        Index("uq_order_fulfillment_order", "order_id", unique=True),
        Index(
            "idx_order_fulfillment_unverified", "order_id",
            postgresql_where=identity_verified_at.is_(None),
        ),
    )
