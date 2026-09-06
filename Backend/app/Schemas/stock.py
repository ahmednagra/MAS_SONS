# app/Schemas/stock.py
# Unit request/response schemas (databaseschema.md §2).
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict, Field

from app.Schemas.destination import DestinationResponse


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
    """List/search row — the columns a stock grid actually renders."""
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
    """Full detail view — everything UnitSummaryResponse has, plus the rest of the row and its two eager-loaded collections."""
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
    """Query params for GET /stock — every field is optional; an unset field applies no filter."""

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

    sort: str = Field(default="newest", pattern="^(newest|price_asc|price_desc|year_desc|mileage_asc|grade_desc)$")
    cursor: Optional[int] = Field(default=None, description="Last-seen unit id from the previous page")
    cursor_value: Optional[str] = Field(default=None, description="Sort-column value of that last unit (non-newest sorts)")
    limit: int = Field(default=24, ge=1, le=100)


class StockListResponse(BaseModel):
    items: List[UnitSummaryResponse]
    next_cursor: Optional[int] = None
    next_cursor_value: Optional[str] = None
    total: Optional[int] = Field(default=None, description="Matching units; only computed on the first page")


class FacetCount(BaseModel):
    value: str
    count: int


class StockFacetsResponse(BaseModel):
    """Aggregate counts over in-stock, non-deleted units — what the storefront's browse-by-make / body-type tiles, the hero finder, and the category landing…"""

    total: int
    vehicles: int
    equipment: int
    makes: List[FacetCount]
    body_types: List[FacetCount]
    steering_positions: List[FacetCount] = []
    fuel_types: List[FacetCount] = []
    grades: List[FacetCount] = []
    year_min: Optional[int] = None
    year_max: Optional[int] = None
    price_min: Optional[float] = None
    price_max: Optional[float] = None


class StockCountResponse(BaseModel):
    count: int


class UnitPriceUpdate(BaseModel):
    price_usd: float


# ---- Detail-page insights (GET /stock/{slug}/insights) ------------------------- Everything the storefront's "market position" / shipping / equipment…

class GradeCount(BaseModel):
    grade: str
    count: int


class PricePoint(BaseModel):
    """One dot on the price-vs-usage scatter."""
    id: int
    slug: str
    year: int
    price_usd: float
    usage: Optional[int] = None
    auction_grade: str
    is_current: bool = False


class MarketPosition(BaseModel):
    scope: str = Field(description="'model' (same make+model), 'body_type', or 'category' — widest scope that had enough peers")
    label: str
    peer_count: int
    price_min: Optional[float] = None
    price_median: Optional[float] = None
    price_max: Optional[float] = None
    price_avg: Optional[float] = None
    usage_avg: Optional[int] = None
    usage_unit: str = "km"
    price_percentile: Optional[int] = Field(default=None, description="% of peers priced at or below this unit (0-100)")
    usage_percentile: Optional[int] = Field(default=None, description="% of peers with usage at or below this unit (0-100)")
    grade_distribution: List[GradeCount] = []


class UnitInsightsResponse(BaseModel):
    market: MarketPosition
    comparables: List[UnitSummaryResponse] = []
    price_points: List[PricePoint] = []
    destinations: List[DestinationResponse] = []
    feature_catalog: List[FeatureResponse] = []
