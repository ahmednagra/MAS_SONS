# app/Services/FavoriteService.py
# Buyer favourites: idempotent add (restores a soft-deleted row), soft remove, list.
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Favorite, User
from app.Schemas.favorite import FavoriteCreate, FavoriteResponse


class FavoriteService:
    @staticmethod
    def add(user: User, data: FavoriteCreate, db: Session) -> FavoriteResponse:
        row = db.execute(
            select(Favorite).where(Favorite.user_id == user.id, Favorite.unit_id == data.unit_id)
        ).scalars().first()
        if row is None:
            row = Favorite(user_id=user.id, unit_id=data.unit_id)
            db.add(row)
        elif row.deleted_at is not None:
            row.deleted_at = None
            row.deleted_by = None
        else:
            return FavoriteResponse.model_validate(row)
        db.commit()
        db.refresh(row)
        return FavoriteResponse.model_validate(row)

    @staticmethod
    def remove(user: User, unit_id: int, db: Session) -> None:
        row = db.execute(
            select(Favorite).where(Favorite.user_id == user.id, Favorite.unit_id == unit_id, Favorite.deleted_at.is_(None))
        ).scalars().first()
        if row is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Favorite not found")
        row.deleted_at = datetime.now(timezone.utc)
        row.deleted_by = user.id
        db.commit()

    @staticmethod
    def list_mine(user: User, db: Session) -> list[FavoriteResponse]:
        rows = db.execute(
            select(Favorite)
            .where(Favorite.user_id == user.id, Favorite.deleted_at.is_(None))
            .order_by(Favorite.created_at.desc())
        ).scalars().all()
        return [FavoriteResponse.model_validate(r) for r in rows]
