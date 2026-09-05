# routes/api/v0/stock.py

# Stock list/search, detail, admin update endpoints (databaseschema.md §2). Guest-
# accessible — no auth dependency, matching the Feature Audit's guest-browsing rule.
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Controllers.StockController import StockController
from app.Schemas.stock import (
    StockCountResponse, StockFacetsResponse, StockListResponse, StockSearchParams, UnitResponse,
)
from config.database import get_db

router = APIRouter(prefix="/stock", tags=["Stock"])


@router.get("", response_model=StockListResponse)
def search_stock(params: StockSearchParams = Depends(), db: Session = Depends(get_db)):
    return StockController.search(params, db)


# Static sub-paths are declared BEFORE the catch-all "/{slug}" — FastAPI matches
# routes in declaration order, so "/count" and "/facets" would otherwise be
# swallowed as slugs and 404.
@router.get("/count", response_model=StockCountResponse)
def count_stock(db: Session = Depends(get_db)):
    return StockController.count(db)


@router.get("/facets", response_model=StockFacetsResponse)
def stock_facets(db: Session = Depends(get_db)):
    return StockController.facets(db)


@router.get("/{slug}", response_model=UnitResponse)
def get_unit(slug: str, db: Session = Depends(get_db)):
    return StockController.get_by_slug(slug, db)
