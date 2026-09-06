# app/Controllers/FavoriteController.py
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.favorite import FavoriteCreate, FavoriteResponse
from app.Services.FavoriteService import FavoriteService
from app.Utils.Logger import logger


class FavoriteController:
    @staticmethod
    def add(user: User, data: FavoriteCreate, db: Session) -> FavoriteResponse:
        try:
            return FavoriteService.add(user, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in add: {e}")
            raise

    @staticmethod
    def remove(user: User, unit_id: int, db: Session) -> None:
        try:
            FavoriteService.remove(user, unit_id, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in remove: {e}")
            raise

    @staticmethod
    def list_mine(user: User, db: Session) -> list[FavoriteResponse]:
        try:
            return FavoriteService.list_mine(user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_mine: {e}")
            raise
