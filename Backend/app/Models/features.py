# app/Models/features.py

# features — controlled equipment/options vocabulary (databaseschema.md §2).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class Feature(Base):
    """Controlled vocabulary of options/equipment — the Feature Audit's 'structured
    options/equipment list'. A lookup table, not free text, so the same feature is
    never spelled three different ways across units.
    """

    __tablename__ = "features"

    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    category = Column(Text, nullable=False)
    applies_to = Column(Text, nullable=False, server_default="both")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    deleter = relationship("User", foreign_keys=[deleted_by])
    unit_features = relationship("UnitFeature", back_populates="feature")

    __table_args__ = (
        CheckConstraint(
            "category IN ('comfort','safety','exterior','mechanical','equipment_attachment')",
            name="ck_features_category",
        ),
        CheckConstraint("applies_to IN ('vehicle','equipment','both')", name="ck_features_applies_to"),
        Index("uq_features_name", "name", unique=True, postgresql_where=deleted_at.is_(None)),
        Index("idx_features_category", "category", "applies_to", postgresql_where=deleted_at.is_(None)),
    )
