# app/Controllers/SavedSearchController.py
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.saved_search import SavedSearchCreate, SavedSearchResponse, SavedSearchUpdate
from app.Services.SavedSearchService import SavedSearchService
from app.Utils.Logger import logger


class SavedSearchController:
    @staticmethod
    def create(user: User, data: SavedSearchCreate, db: Session) -> SavedSearchResponse:
        try:
            return SavedSearchService.create(user, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create: {e}")
            raise

    @staticmethod
    def list_mine(user: User, db: Session) -> list[SavedSearchResponse]:
        try:
            return SavedSearchService.list_mine(user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_mine: {e}")
            raise

    @staticmethod
    def update(user: User, id: int, data: SavedSearchUpdate, db: Session) -> SavedSearchResponse:
        try:
            return SavedSearchService.update(user, id, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update: {e}")
            raise

    @staticmethod
    def delete(user: User, id: int, db: Session) -> None:
        try:
            SavedSearchService.delete(user, id, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in delete: {e}")
            raise
