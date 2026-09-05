export type UnitCategory = 'vehicle' | 'equipment';
export type SteeringPosition = 'LHD' | 'RHD';
export type AuctionGrade = '5' | '4.5' | '4' | '3.5' | '3' | 'R' | 'RA';

export interface UnitImage {
  id: string;
  url: string;
}

export interface Unit {
  id: string;
  slug: string;
  category: UnitCategory;
  make: string;
  model: string;
  year: number;
  price: number; // USD
  port: string; // FOB loading port, e.g. "Yokohama"
  mileage?: number; // km — vehicles only
  hours?: number; // operating hours — equipment only
  steeringPosition?: SteeringPosition; // vehicles only
  auctionGrade: AuctionGrade;
  repairHistory: boolean; // 修復歴
  chassisNumber: string;
  engine?: string;
  displacementCc?: number;
  fuelType?: string;
  transmission?: string;
  description: string;
  images: UnitImage[];
  status: 'in_stock' | 'sold' | 'sourcing';
  updatedAt: string;
}

export interface UpdateUnitInput {
  price?: number;
  status?: Unit['status'];
}

export interface StockSearchParams {
  make?: string;
  model?: string;
  category?: UnitCategory;
  priceMin?: number;
  priceMax?: number;
  yearMin?: number;
  yearMax?: number;
  steeringPosition?: SteeringPosition;
  auctionGrade?: AuctionGrade;
  shippableTo?: string; // destination country code
  page?: number;
  limit?: number;
}
