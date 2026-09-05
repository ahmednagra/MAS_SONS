export type Incoterm = 'FOB' | 'CFR' | 'CIF';

export interface CreateQuoteRequest {
  unitId: string;
  destinationCountry: string; // ISO 3166-1 alpha-2
  incoterm: Incoterm;
  email: string;
  whatsapp?: string;
}

export interface QuoteRequest extends CreateQuoteRequest {
  id: string;
  status: 'pending' | 'quoted' | 'closed';
  createdAt: string;
}
