# app/Models/destinations.py

# destinations — shipping/port/Incoterm reference data (databaseschema.md §9).
from sqlalchemy import Column, BigInteger, SmallInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, func
from app.Models.base import Base


class Destination(Base):
    """Per-destination shipping/port/Incoterm reference data backing every destination
    landing page and every request/order's destination FK.
    """

    __tablename__ = "destinations"

    country_code = Column(Text, primary_key=True)  # CHAR(2) at the DB level
    country_name = Column(Text, nullable=False)
    primary_port = Column(Text, nullable=False)
    origin_port = Column(Text, nullable=False)
    estimated_transit_days = Column(SmallInteger)
    shipping_mode = Column(Text)
    import_regulations_summary = Column(Text)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    __table_args__ = (
        CheckConstraint("origin_port IN ('Yokohama','Nagoya')", name="ck_destinations_origin_port"),
        CheckConstraint("shipping_mode IN ('roro','container','both')", name="ck_destinations_shipping_mode"),
    )
