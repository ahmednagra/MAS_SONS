// src/lib/stock-filters.ts
// Filter keys and the facet-param mapping for /stock, shared by the server page and the client panel.
import type { StockSearchParams } from '@/types/stock';

export const FINDER_KEYS = [
  'category', 'make', 'model', 'body_type', 'year_min', 'year_max', 'price_min', 'price_max', 'steering_position', 'auction_grade_min', 'fuel_type',
] as const;
export type FinderKey = (typeof FINDER_KEYS)[number];
export type FinderValues = Partial<Record<FinderKey, string>>;

/** Only the filters the facets endpoint can count by; free-text fields would just make every count 0 while typing. */
export function facetParams(v: FinderValues): StockSearchParams {
  const num = (s?: string) => (s && Number.isFinite(Number(s)) ? Number(s) : undefined);
  return {
    category: v.category === 'vehicle' || v.category === 'equipment' ? v.category : undefined,
    make: v.make || undefined,
    body_type: v.body_type || undefined,
    year_min: num(v.year_min),
    year_max: num(v.year_max),
    price_min: num(v.price_min),
    price_max: num(v.price_max),
    steering_position: v.steering_position === 'LHD' || v.steering_position === 'RHD' ? v.steering_position : undefined,
    auction_grade_min: v.auction_grade_min as StockSearchParams['auction_grade_min'],
    fuel_type: v.fuel_type || undefined,
  };
}
