// Mirrors the backend API shape exactly (app/Schemas/stock.py) — snake_case, no case-mapping layer.
export type UnitCategory = 'vehicle' | 'equipment';
export type SteeringPosition = 'LHD' | 'RHD';
export type AuctionGrade = '5' | '4.5' | '4' | '3.5' | '3' | 'R' | 'RA';
export type UnitStatus = 'in_stock' | 'sold' | 'sourcing';

export interface UnitImage {
  id: number;
  url: string;
  photo_type: 'exterior' | 'interior' | 'engine_bay' | 'undercarriage' | 'odometer' | 'other';
  alt_text?: string | null;
  sort_order: number;
}

export interface Feature {
  id: number;
  name: string;
  category: string;
}

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
  thumbnail_url?: string | null;
}

export interface Unit extends UnitSummary {
  steering_position?: SteeringPosition | null;
  repair_history: boolean;
  one_owner?: boolean | null;
  auction_sheet_url?: string | null;
  chassis_number: string;
  engine?: string | null;
  displacement_cc?: number | null;
  drivetrain?: string | null;
  fuel_type?: string | null;
  transmission?: string | null;
  description: string;
  created_at: string;
  updated_at: string;
  images: UnitImage[];
  features: Feature[];
}

export interface UpdateUnitInput {
  price_usd?: number;
  status?: UnitStatus;
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
  cursor?: number;
  limit?: number;
}

export interface StockListResponse {
  items: UnitSummary[];
  next_cursor?: number | null;
}
