// Mirrors app/Schemas/destination.py (DestinationResponse) — snake_case, no case-mapping layer.
export type OriginPort = 'Yokohama' | 'Nagoya';
export type ShippingMode = 'roro' | 'container' | 'both';

export interface Destination {
  /** ISO 3166-1 alpha-2, upper-case */
  country_code: string;
  country_name: string;
  primary_port: string;
  origin_port: OriginPort;
  estimated_transit_days?: number | null;
  shipping_mode?: ShippingMode | null;
  import_regulations_summary?: string | null;
}
