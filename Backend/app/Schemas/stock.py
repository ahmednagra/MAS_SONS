# app/Schemas/stock.py

# Unit request/response schemas (databaseschema.md §2). Filter fields match the
# Search & Filters module reconciled against databaseschema.md earlier in this
# project's design pass — every filter here maps to an indexed units column.
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field


class UnitImageResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    photo_type: str
    alt_text: Optional[str] = None
    sort_order: int


class FeatureResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    category: str


class UnitSummaryResponse(BaseModel):
    """List/search row — the columns a stock grid actually renders. Deliberately
    narrower than UnitResponse (codingconventions.md §6 — don't load full rows when
    a query only needs a few columns)."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    slug: str
    category: str
    body_type: str
    make: str
    model: str
    year: int
    color: Optional[str] = None
    price_usd: float
    port: str
    mileage_km: Optional[int] = None
    operating_hours: Optional[int] = None
    auction_grade: str
    status: str
    steering_position: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    created_at: datetime
    thumbnail_url: Optional[str] = None


class UnitResponse(UnitSummaryResponse):
    """Full detail view — everything UnitSummaryResponse has, plus the rest of the
    row and its two eager-loaded collections."""
    repair_history: bool
    one_owner: Optional[bool] = None
    auction_sheet_url: Optional[str] = None
    chassis_number: str
    engine: Optional[str] = None
    displacement_cc: Optional[int] = None
    drivetrain: Optional[str] = None
    fuel_type: Optional[str] = None
    description: str
    updated_at: datetime

    images: List[UnitImageResponse] = []
    features: List[FeatureResponse] = []


class StockSearchParams(BaseModel):
    """Query params for GET /stock — every field is optional; an unset field applies
    no filter. Pagination is keyset-style on `id` (codingconventions.md §6 — never
    OFFSET on a table that can grow past a few thousand rows)."""

    category: Optional[str] = None
    body_type: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None
    mileage_max_km: Optional[int] = None
    auction_grade_min: Optional[str] = None
    steering_position: Optional[str] = None
    fuel_type: Optional[str] = None
    transmission: Optional[str] = None
    keyword: Optional[str] = Field(default=None, description="Free-text search over make/model/description")

    cursor: Optional[int] = Field(default=None, description="Last-seen unit id from the previous page")
    limit: int = Field(default=24, ge=1, le=100)


class StockListResponse(BaseModel):
    items: List[UnitSummaryResponse]
    next_cursor: Optional[int] = None


class FacetCount(BaseModel):
    value: str
    count: int


class StockFacetsResponse(BaseModel):
    """Aggregate counts over in-stock, non-deleted units — what the storefront's
    browse-by-make / body-type tiles and the hero's "N units in stock" line render.
    Every figure comes from a GROUP BY on an indexed units column; nothing here is
    derived from a page of rows."""

    total: int
    vehicles: int
    equipment: int
    makes: List[FacetCount]
    body_types: List[FacetCount]


class StockCountResponse(BaseModel):
    count: int
