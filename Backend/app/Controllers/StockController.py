# app/Controllers/StockController.py
# Stock catalog endpoints — list/search, detail, admin update (databaseschema.md §2).
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Schemas.stock import (
    StockCountResponse, StockFacetsResponse, StockListResponse, StockSearchParams,
    UnitInsightsResponse, UnitPriceUpdate, UnitResponse,
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
    def facets(db: Session, category: Optional[str] = None) -> StockFacetsResponse:
        try:
            return StockService.facets(db, category)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in facets: {e}")
            raise

    @staticmethod
    def get_by_ids(ids: list[int], db: Session) -> StockListResponse:
        try:
            return StockService.get_by_ids(ids, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_ids: {e}")
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

    @staticmethod
    def insights(slug: str, db: Session) -> UnitInsightsResponse:
        try:
            return StockService.insights(slug, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in insights: {e}")
            raise

    @staticmethod
    def update_price(id: int, data: UnitPriceUpdate, db: Session) -> UnitResponse:
        try:
            return StockService.update_price(id, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_price: {e}")
            raise
