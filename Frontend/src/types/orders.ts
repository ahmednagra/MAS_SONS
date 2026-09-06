// Mirrors the backend API shape exactly (app/Schemas/order.py) — snake_case, no case-mapping layer.
export type PaymentStatus = string;
export type ShippingStatus = string;

export interface Order {
  id: number;
  quote_request_id?: number | null;
  sourcing_request_id?: number | null;
  unit_id: number;
  user_id?: number | null;
  contact_name: string;
  contact_email: string;
  final_price_usd: number;
  incoterm: string;
  destination_country: string;
  invoice_number?: string | null;
  payment_status: PaymentStatus;
  shipping_status: ShippingStatus;
  shipping_status_updated_at?: string | null;
  created_at: string;
}

export interface OrderFulfillmentDetailInput {
  consignee_name: string;
  consignee_phone: string;
  shipping_address_line1: string;
  shipping_address_line2?: string | null;
  shipping_city: string;
  shipping_state_province?: string | null;
  shipping_postal_code?: string | null;
}

export interface OrderFulfillmentDetailResponse extends OrderFulfillmentDetailInput {
  id: number;
  identity_document_type?: string | null;
  identity_document_url?: string | null;
  identity_verified_at?: string | null;
}
