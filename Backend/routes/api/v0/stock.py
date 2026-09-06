# routes/api/v0/stock.py
# Stock list/search, detail, admin update endpoints (databaseschema.md §2).
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.StockController import StockController
from app.Schemas.stock import (
    StockCountResponse, StockFacetsResponse, StockListResponse, StockSearchParams, UnitInsightsResponse,
    UnitResponse,
)
from config.database import get_db

router = APIRouter(prefix="/stock", tags=["Stock"])


@router.get("", response_model=StockListResponse)
def search_stock(params: StockSearchParams = Depends(), db: Session = Depends(get_db)):
    return StockController.search(params, db)


# Static sub-paths are declared BEFORE the catch-all "/{slug}" — FastAPI matches routes in declaration order, so "/count" and "/facets" would otherwise…
@router.get("/count", response_model=StockCountResponse)
def count_stock(db: Session = Depends(get_db)):
    return StockController.count(db)


@router.get("/facets", response_model=StockFacetsResponse)
def stock_facets(
    category: Optional[str] = Query(default=None, pattern="^(vehicle|equipment)$"),
    db: Session = Depends(get_db),
):
    return StockController.facets(db, category)


@router.get("/by-ids", response_model=StockListResponse)
def get_units_by_ids(ids: list[int] = Query(default=[]), db: Session = Depends(get_db)):
    return StockController.get_by_ids(ids, db)


@router.get("/{slug}", response_model=UnitResponse)
def get_unit(slug: str, db: Session = Depends(get_db)):
    return StockController.get_by_slug(slug, db)


@router.get("/{slug}/insights", response_model=UnitInsightsResponse)
def get_unit_insights(slug: str, db: Session = Depends(get_db)):
    return StockController.insights(slug, db)
