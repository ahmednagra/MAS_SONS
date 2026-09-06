# app/Models/unit_images.py
# unit_images — photo_type-categorized gallery (databaseschema.md §2).
from sqlalchemy import (
    Column, BigInteger, SmallInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func, text,
)
from sqlalchemy.orm import relationship

from app.Models.base import Base


class UnitImage(Base):
    """Photo gallery per unit, including the trust-critical odometer photo."""

    __tablename__ = "unit_images"

    id = Column(BigInteger, primary_key=True)
    unit_id = Column(BigInteger, ForeignKey("units.id", ondelete="CASCADE"), nullable=False)
    url = Column(Text, nullable=False)
    photo_type = Column(Text, nullable=False, server_default="exterior")
    alt_text = Column(Text)
    sort_order = Column(SmallInteger, nullable=False, server_default=text("0"))
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    unit = relationship("Unit", back_populates="images")
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        CheckConstraint(
            "photo_type IN ('exterior','interior','engine_bay','undercarriage','odometer','other')",
            name="ck_unit_images_photo_type",
        ),
        Index("idx_unit_images_unit", "unit_id", "sort_order", postgresql_where=deleted_at.is_(None)),
    )
