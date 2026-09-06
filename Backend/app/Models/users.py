# app/Models/users.py
# users (databaseschema.md §1).
from sqlalchemy import Column, BigInteger, Text, TIMESTAMP, ForeignKey, CheckConstraint, Index, func
from sqlalchemy.orm import relationship

from app.Models.base import Base


class User(Base):
    """One row per person who can authenticate: buyers (optional account) and staff."""

    __tablename__ = "users"

    id = Column(BigInteger, primary_key=True)
    email = Column(Text, nullable=False)  # CITEXT at the DB level; unique index below
    email_verified_at = Column(TIMESTAMP(timezone=True))
    full_name = Column(Text, nullable=False)
    phone = Column(Text)
    user_type = Column(Text, nullable=False)
    staff_role = Column(Text)
    status = Column(Text, nullable=False, server_default="active")
    timezone = Column(Text, nullable=False, server_default="UTC")
    locale = Column(Text, nullable=False, server_default="en")
    created_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())
    deleted_at = Column(TIMESTAMP(timezone=True))
    deleted_by = Column(BigInteger, ForeignKey("users.id"))

    deleter = relationship("User", remote_side=[id], foreign_keys=[deleted_by])

    __table_args__ = (
        CheckConstraint("user_type IN ('buyer','staff')", name="ck_users_user_type"),
        CheckConstraint("staff_role IN ('admin','stock_manager','sales')", name="ck_users_staff_role"),
        CheckConstraint("status IN ('active','suspended','deleted')", name="ck_users_status"),
        CheckConstraint("staff_role IS NULL OR user_type = 'staff'", name="chk_users_staff_role_requires_staff"),
        Index("idx_users_email", "email", unique=True, postgresql_where=deleted_at.is_(None)),
        Index("idx_users_type_status", "user_type", "status", postgresql_where=deleted_at.is_(None)),
    )
