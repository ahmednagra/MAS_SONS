# app/Utils/Query.py
# Shared query helpers: soft-delete-aware lookups, keyset pagination, child-row batching.
from collections import defaultdict
from typing import Any, Optional, Sequence, Type, TypeVar

from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlalchemy import Select, select
from sqlalchemy.orm import Session

T = TypeVar("T")


def get_live(db: Session, model: Type[T], id: Any, detail: str) -> T:
    """Primary-key lookup that 404s on a missing or soft-deleted row."""
    row = db.get(model, id)
    if row is None or getattr(row, "deleted_at", None) is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return row


def first_live(db: Session, stmt: Select, detail: str):
    """First row of `stmt`, 404 when absent or soft-deleted."""
    row = db.execute(stmt).scalars().first()
    if row is None or getattr(row, "deleted_at", None) is not None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=detail)
    return row


def keyset_page(stmt: Select, id_column, cursor: Optional[int], limit: int) -> Select:
    """Apply `id < cursor` keyset pagination ordered newest-first."""
    if cursor is not None:
        stmt = stmt.where(id_column < cursor)
    return stmt.order_by(id_column.desc()).limit(limit)


def children_by_parent(
    db: Session, model: Type[T], parent_column, parent_ids: Sequence[Any], order_column,
) -> dict[Any, list[T]]:
    """One query for every live child of a page of parents, keyed by parent id (never N+1)."""
    if not parent_ids:
        return {}
    rows = db.execute(
        select(model)
        .where(parent_column.in_(parent_ids), model.deleted_at.is_(None))
        .order_by(parent_column, order_column)
    ).scalars().all()
    grouped: dict[Any, list[T]] = defaultdict(list)
    for row in rows:
        grouped[getattr(row, parent_column.key)].append(row)
    return grouped


def to_schema(schema: Type[BaseModel], row: Any, **overrides: Any) -> BaseModel:
    """Build a response from the row's already-loaded attributes; overridden fields are never read (no lazy loads)."""
    data = {name: getattr(row, name) for name in schema.model_fields if name not in overrides}
    return schema.model_validate({**data, **overrides})
