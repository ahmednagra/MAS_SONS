// Mirrors app/Schemas/sourcing_request.py — snake_case, no case-mapping layer.
import type { AuctionGrade } from './stock';
import type { Incoterm } from './quote-requests';

export type SourcingStatus = 'pending' | 'sourcing' | 'found' | 'closed';

// SourcingRequestCreate
export interface CreateSourcingRequest {
  contact_name: string;
  contact_email: string;
  contact_whatsapp?: string | null;
  make?: string | null;
  model_description: string;
  min_auction_grade?: AuctionGrade | null;
  budget_max_usd?: number | null;
  /** ISO 3166-1 alpha-2 — must exist in `destinations` (FK) */
  destination_country?: string | null;
  quote_type?: Incoterm | null;
  buying_timeframe?: string | null;
}

// SourcingRequestResponse
export interface SourcingRequest extends CreateSourcingRequest {
  id: number;
  user_id?: number | null;
  status: SourcingStatus;
  created_at: string;
}
