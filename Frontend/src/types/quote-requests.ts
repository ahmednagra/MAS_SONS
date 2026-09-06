// Mirrors app/Schemas/quote_request.py — snake_case, no case-mapping layer.
export type Incoterm = 'FOB' | 'CFR' | 'CIF';
export type QuoteStatus = 'pending' | 'quoted' | 'closed';

// QuoteRequestCreate
export interface CreateQuoteRequest {
  unit_id: number;
  contact_name: string;
  contact_email: string;
  contact_whatsapp?: string | null;
  /** ISO 3166-1 alpha-2 — must exist in `destinations` (FK) */
  destination_country: string;
  incoterm: Incoterm;
  notes?: string | null;
}

// QuoteRequestResponse
export interface QuoteRequest {
  id: number;
  unit_id: number;
  user_id?: number | null;
  contact_name: string;
  contact_email: string;
  contact_whatsapp?: string | null;
  destination_country: string;
  incoterm: Incoterm;
  status: QuoteStatus;
  quoted_price_usd?: number | null;
  quoted_at?: string | null;
  notes?: string | null;
  created_at: string;
  unit_make?: string | null;
  unit_model?: string | null;
  unit_year?: number | null;
}
