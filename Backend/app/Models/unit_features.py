# app/Models/unit_features.py

# unit_features — unit↔feature confirmation junction (databaseschema.md §2).
from sqlalchemy import Column, BigInteger, TIMESTAMP, ForeignKey, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class UnitFeature(Base):
    """Many-to-many: which features apply to which unit.

    Composite PK (unit_id, feature_id). Re-confirming a retracted feature restores the
    existing soft-deleted row (deleted_at = NULL) rather than inserting a duplicate —
    the PK does not special-case deleted_at.
    """

    __tablename__ = "unit_features"

    unit_id = Column(BigInteger, ForeignKey("units.id", ondelete="CASCADE"), primary_key=True)
    feature_id = Column(BigInteger, ForeignKey("features.id", ondelete="CASCADE"), primary_key=True)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    unit = relationship("Unit", back_populates="unit_features")
    feature = relationship("Feature", back_populates="unit_features")
    deleter = relationship("User", foreign_keys=[deleted_by])

    __table_args__ = (
        Index("idx_unit_features_feature", "feature_id"),
    )
