# app/Services/SavedSearchService.py
# Buyer saved searches: create, list, owner-scoped update and soft delete.
from datetime import datetime, timezone

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import SavedSearch, User
from app.Schemas.saved_search import SavedSearchCreate, SavedSearchResponse, SavedSearchUpdate


class SavedSearchService:
    @staticmethod
    def create(user: User, data: SavedSearchCreate, db: Session) -> SavedSearchResponse:
        row = SavedSearch(user_id=user.id, **data.model_dump())
        db.add(row)
        db.commit()
        db.refresh(row)
        return SavedSearchResponse.model_validate(row)

    @staticmethod
    def list_mine(user: User, db: Session) -> list[SavedSearchResponse]:
        rows = db.execute(
            select(SavedSearch)
            .where(SavedSearch.user_id == user.id, SavedSearch.deleted_at.is_(None))
            .order_by(SavedSearch.created_at.desc())
        ).scalars().all()
        return [SavedSearchResponse.model_validate(r) for r in rows]

    @staticmethod
    def _get_owned(user: User, id: int, db: Session) -> SavedSearch:
        row = db.get(SavedSearch, id)
        if row is None or row.deleted_at is not None or row.user_id != user.id:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Saved search not found")
        return row

    @staticmethod
    def update(user: User, id: int, data: SavedSearchUpdate, db: Session) -> SavedSearchResponse:
        row = SavedSearchService._get_owned(user, id, db)
        for field, value in data.model_dump(exclude_unset=True).items():
            setattr(row, field, value)
        db.commit()
        db.refresh(row)
        return SavedSearchResponse.model_validate(row)

    @staticmethod
    def delete(user: User, id: int, db: Session) -> None:
        row = SavedSearchService._get_owned(user, id, db)
        row.deleted_at = datetime.now(timezone.utc)
        row.deleted_by = user.id
        db.commit()
