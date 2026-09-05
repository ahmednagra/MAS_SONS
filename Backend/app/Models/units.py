# app/Models/units.py

# units — the stock catalog, category-discriminated (databaseschema.md §2).
from sqlalchemy import (
    Column, BigInteger, SmallInteger, Integer, Text, Numeric, Boolean, TIMESTAMP,
    ForeignKey, CheckConstraint, Index, func, text,
)
from sqlalchemy.dialects.postgresql import TSVECTOR
from sqlalchemy.orm import relationship

from app.Models.base import Base


class Unit(Base):
    """The stock catalog — one row per vehicle or equipment unit for sale.

    `category` discriminates vehicle vs. equipment; one table avoids UNION'ing two
    near-identical catalogs on every browse/search query.
    """

    __tablename__ = "units"

    id = Column(BigInteger, primary_key=True)
    slug = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    body_type = Column(Text, nullable=False)
    make = Column(Text, nullable=False)
    model = Column(Text, nullable=False)
    year = Column(SmallInteger, nullable=False)
    color = Column(Text)
    price_usd = Column(Numeric(12, 2), nullable=False)
    port = Column(Text, nullable=False)
    mileage_km = Column(Integer)
    operating_hours = Column(Integer)
    steering_position = Column(Text)
    auction_grade = Column(Text, nullable=False)
    repair_history = Column(Boolean, nullable=False, server_default=text("false"))
    one_owner = Column(Boolean)
    auction_sheet_url = Column(Text)
    chassis_number = Column(Text, nullable=False)
    engine = Column(Text)
    displacement_cc = Column(Integer)
    drivetrain = Column(Text)
    fuel_type = Column(Text)
    transmission = Column(Text)
    description = Column(Text, nullable=False)
    # search_vector TSVECTOR GENERATED ALWAYS AS (...) STORED — a DB-generated column;
    # mapped read-only so the ORM never tries to write it.
    search_vector = Column(TSVECTOR)
    status = Column(Text, nullable=False, server_default="in_stock")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    deleter = relationship("User", foreign_keys=[deleted_by])
    images = relationship("UnitImage", back_populates="unit")
    unit_features = relationship("UnitFeature", back_populates="unit")

    __table_args__ = (
        CheckConstraint("category IN ('vehicle','equipment')", name="ck_units_category"),
        CheckConstraint("steering_position IN ('LHD','RHD')", name="ck_units_steering_position"),
        CheckConstraint(
            "auction_grade IN ('5','4.5','4','3.5','3','R','RA')", name="ck_units_auction_grade"
        ),
        CheckConstraint("status IN ('in_stock','sold','sourcing')", name="ck_units_status"),
        CheckConstraint("price_usd > 0", name="chk_units_price_positive"),
        CheckConstraint("mileage_km IS NULL OR mileage_km >= 0", name="chk_units_mileage_nonneg"),
        CheckConstraint(
            "operating_hours IS NULL OR operating_hours >= 0", name="chk_units_hours_nonneg"
        ),
        Index("idx_units_status_category", "status", "category", postgresql_where=deleted_at.is_(None)),
        Index("idx_units_make_model", "make", "model", postgresql_where=deleted_at.is_(None)),
        Index("idx_units_grade", "auction_grade", postgresql_where=deleted_at.is_(None)),
        Index(
            "idx_units_price", "price_usd",
            postgresql_where=(deleted_at.is_(None)) & (status == "in_stock"),
        ),
        Index("idx_units_search_vector", "search_vector", postgresql_using="gin"),
        Index("uq_units_slug", "slug", unique=True, postgresql_where=deleted_at.is_(None)),
    )
