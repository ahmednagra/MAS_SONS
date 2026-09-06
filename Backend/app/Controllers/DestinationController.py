# app/Controllers/DestinationController.py
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Schemas.destination import DestinationResponse, DestinationUpsert
from app.Services.DestinationService import DestinationService
from app.Utils.Logger import logger


class DestinationController:
    @staticmethod
    def list_all(db: Session) -> list[DestinationResponse]:
        try:
            return DestinationService.list_all(db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_all: {e}")
            raise

    @staticmethod
    def get_by_country(country_code: str, db: Session) -> DestinationResponse:
        try:
            return DestinationService.get_by_country(country_code, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_country: {e}")
            raise

    @staticmethod
    def upsert(data: DestinationUpsert, db: Session) -> DestinationResponse:
        try:
            return DestinationService.upsert(data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in upsert: {e}")
            raise
