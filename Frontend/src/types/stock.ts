// Mirrors the backend API shape exactly (app/Schemas/stock.py) — snake_case, no case-mapping layer.
import type { Destination } from './destinations';

export type UnitCategory = 'vehicle' | 'equipment';
export type SteeringPosition = 'LHD' | 'RHD';
export type AuctionGrade = '5' | '4.5' | '4' | '3.5' | '3' | 'R' | 'RA';
export type UnitStatus = 'in_stock' | 'sold' | 'sourcing';
export type PhotoType = 'exterior' | 'interior' | 'engine_bay' | 'undercarriage' | 'odometer' | 'other';
export type FeatureCategory = 'comfort' | 'safety' | 'exterior' | 'mechanical' | 'equipment_attachment';

export interface UnitImage {
  id: number;
  url: string;
  photo_type: PhotoType;
  alt_text?: string | null;
  sort_order: number;
}

export interface Feature {
  id: number;
  name: string;
  category: FeatureCategory;
}

// UnitSummaryResponse
export interface UnitSummary {
  id: number;
  slug: string;
  category: UnitCategory;
  body_type: string;
  make: string;
  model: string;
  year: number;
  color?: string | null;
  price_usd: number;
  port: string;
  mileage_km?: number | null;
  operating_hours?: number | null;
  auction_grade: AuctionGrade;
  status: UnitStatus;
  steering_position?: SteeringPosition | null;
  transmission?: string | null;
  fuel_type?: string | null;
  created_at: string;
  thumbnail_url?: string | null;
}

// UnitResponse
export interface Unit extends UnitSummary {
  repair_history: boolean;
  one_owner?: boolean | null;
  auction_sheet_url?: string | null;
  chassis_number: string;
  engine?: string | null;
  displacement_cc?: number | null;
  drivetrain?: string | null;
  description: string;
  updated_at: string;
  images: UnitImage[];
  features: Feature[];
}

// UnitPriceUpdate (app/Schemas/stock.py) — the only field PATCH /admin/stock/{id}/price accepts.
export interface UnitPriceUpdate {
  price_usd: number;
}

export interface StockSearchParams {
  category?: UnitCategory;
  body_type?: string;
  make?: string;
  model?: string;
  year_min?: number;
  year_max?: number;
  price_min?: number;
  price_max?: number;
  mileage_max_km?: number;
  auction_grade_min?: AuctionGrade;
  steering_position?: SteeringPosition;
  fuel_type?: string;
  transmission?: string;
  keyword?: string;
  sort?: 'newest' | 'price_asc' | 'price_desc' | 'year_desc' | 'mileage_asc' | 'grade_desc';
  cursor?: number;
  /** Sort-column value of the last unit on the previous page (non-newest sorts). */
  cursor_value?: string;
  limit?: number;
}

export interface StockListResponse {
  items: UnitSummary[];
  next_cursor?: number | null;
  next_cursor_value?: string | null;
  /** Matching units; only present on the first page. */
  total?: number | null;
}

// ---- GET /stock/facets (StockFacetsResponse) ---------------------------------

export interface FacetCount {
  value: string;
  count: number;
}

export interface StockFacets {
  total: number;
  vehicles: number;
  equipment: number;
  /** Top makes by in-stock count, capped server-side. */
  makes: FacetCount[];
  /** Top body types by in-stock count, capped server-side. */
  body_types: FacetCount[];
  /** Only values present in stock (at most LHD/RHD). */
  steering_positions: FacetCount[];
  fuel_types: FacetCount[];
  grades: FacetCount[];
  year_min?: number | null;
  year_max?: number | null;
  price_min?: number | null;
  price_max?: number | null;
}

// ---- GET /stock/{slug}/insights (UnitInsightsResponse) ----------------------

export interface GradeCount {
  grade: AuctionGrade;
  count: number;
}

export interface PricePoint {
  id: number;
  slug: string;
  year: number;
  price_usd: number;
  /** mileage_km for vehicles, operating_hours for equipment — see MarketPosition.usage_unit */
  usage?: number | null;
  auction_grade: AuctionGrade;
  is_current: boolean;
}

export type MarketScope = 'model' | 'body_type' | 'category';

export interface MarketPosition {
  scope: MarketScope;
  label: string;
  peer_count: number;
  price_min?: number | null;
  price_median?: number | null;
  price_max?: number | null;
  price_avg?: number | null;
  usage_avg?: number | null;
  usage_unit: 'km' | 'hrs';
  /** % of peers priced at or below this unit (0–100) */
  price_percentile?: number | null;
  /** % of peers with usage at or below this unit (0–100) */
  usage_percentile?: number | null;
  grade_distribution: GradeCount[];
}

export interface UnitInsights {
  market: MarketPosition;
  comparables: UnitSummary[];
  price_points: PricePoint[];
  destinations: Destination[];
  feature_catalog: Feature[];
}
