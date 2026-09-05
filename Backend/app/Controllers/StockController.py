# app/Controllers/StockController.py

# Stock catalog endpoints — list/search, detail, admin update (databaseschema.md §2).
# Thin delegation to StockService; catches unexpected exceptions, logs, and re-raises
# (codingconventions.md §3) — StockService itself raises the actual HTTPException.
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Schemas.stock import (
    StockCountResponse, StockFacetsResponse, StockListResponse, StockSearchParams, UnitResponse,
)
from app.Services.StockService import StockService
from app.Utils.Logger import logger


class StockController:
    @staticmethod
    def search(params: StockSearchParams, db: Session) -> StockListResponse:
        try:
            return StockService.search(params, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in search: {e}")
            raise

    @staticmethod
    def count(db: Session) -> StockCountResponse:
        try:
            return StockService.count(db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in count: {e}")
            raise

    @staticmethod
    def facets(db: Session) -> StockFacetsResponse:
        try:
            return StockService.facets(db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in facets: {e}")
            raise

    @staticmethod
    def get_by_slug(slug: str, db: Session) -> UnitResponse:
        try:
            return StockService.get_by_slug(slug, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_slug: {e}")
            raise
