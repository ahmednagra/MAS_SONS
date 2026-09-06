// Mirrors app/Schemas/buyback_lead.py — snake_case, no case-mapping layer.
export type BuybackLeadStatus = 'new' | 'contacted' | 'closed';

export interface BuybackLeadPhoto {
  id: number;
  url: string;
  sort_order: number;
}

// BuybackLeadCreate
export interface CreateBuybackLead {
  name: string;
  phone: string;
  vehicle_or_equipment_description: string;
  photo_urls?: string[];
}

// BuybackLeadResponse
export interface BuybackLead {
  id: number;
  name: string;
  phone: string;
  vehicle_or_equipment_description: string;
  status: BuybackLeadStatus;
  created_at: string;
  photos: BuybackLeadPhoto[];
}
