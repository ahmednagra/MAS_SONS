// Mirrors app/Schemas/review.py — snake_case, no case-mapping layer.
export interface ReviewPhoto {
  id: number;
  url: string;
  sort_order: number;
}

export interface ReviewCreate {
  quote_request_id: number;
  reviewer_name: string;
  destination_country?: string | null;
  rating?: number | null;
  body: string;
  photo_urls?: string[];
}

export interface Review {
  id: number;
  user_id?: number | null;
  quote_request_id?: number | null;
  unit_id?: number | null;
  reviewer_name: string;
  destination_country?: string | null;
  rating?: number | null;
  body: string;
  status: string;
  created_at: string;
  photos: ReviewPhoto[];
}
