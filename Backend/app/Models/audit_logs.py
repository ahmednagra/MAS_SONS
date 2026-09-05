# app/Models/audit_logs.py

# audit_logs — system-wide, one row per action (databaseschema.md §10).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.dialects.postgresql import INET, JSONB
from sqlalchemy.orm import relationship

from app.Models.base import Base


class AuditLog(Base):
    """One row per audited action (not per field) across units, requests, orders,
    reviews and security-relevant user changes. No soft delete — it is the audit
    trail itself. PARTITION BY RANGE (created_at) at the DB level — a migration/DDL
    concern, not something the ORM model itself needs to express.
    """

    __tablename__ = "audit_logs"

    id = Column(BigInteger, primary_key=True)
    entity_type = Column(Text, nullable=False)  # polymorphic, no FK — see Conventions
    entity_id = Column(BigInteger, nullable=False)
    action = Column(Text, nullable=False)
    changed_fields = Column(JSONB)
    actor_type = Column(Text, nullable=False)
    actor_user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    ip_address = Column(INET)
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())

    actor = relationship("User", foreign_keys=[actor_user_id])

    __table_args__ = (
        CheckConstraint(
            "entity_type IN "
            "('unit','quote_request','sourcing_request','buyback_lead','review','user','order')",
            name="ck_audit_logs_entity_type",
        ),
        CheckConstraint("action IN ('create','update','delete')", name="ck_audit_logs_action"),
        CheckConstraint("actor_type IN ('staff','system','buyer')", name="ck_audit_logs_actor_type"),
        Index("idx_audit_logs_entity", "entity_type", "entity_id", "created_at"),
        Index("idx_audit_logs_actor", "actor_user_id", "created_at", postgresql_where=actor_user_id.isnot(None)),
        Index("idx_audit_logs_fields_gin", "changed_fields", postgresql_using="gin"),
    )
