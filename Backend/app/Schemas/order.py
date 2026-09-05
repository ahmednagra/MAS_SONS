# app/Schemas/order.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class OrderFulfillmentDetailInput(BaseModel):
    consignee_name: str
    consignee_phone: str
    shipping_address_line1: str
    shipping_address_line2: Optional[str] = None
    shipping_city: str
    shipping_state_province: Optional[str] = None
    shipping_postal_code: Optional[str] = None


class OrderFulfillmentDetailResponse(OrderFulfillmentDetailInput):
    model_config = ConfigDict(from_attributes=True)

    id: int
    identity_document_type: Optional[str] = None
    identity_document_url: Optional[str] = None
    identity_verified_at: Optional[datetime] = None


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    quote_request_id: Optional[int] = None
    sourcing_request_id: Optional[int] = None
    unit_id: int
    user_id: Optional[int] = None
    contact_name: str
    contact_email: str
    final_price_usd: float
    incoterm: str
    destination_country: str
    invoice_number: Optional[str] = None
    payment_status: str
    shipping_status: str
    shipping_status_updated_at: Optional[datetime] = None
    created_at: datetime


class OrderShippingStatusUpdate(BaseModel):
    shipping_status: str


class OrderPaymentStatusUpdate(BaseModel):
    payment_status: str
    invoice_number: Optional[str] = None


class OrderCreateFromQuote(BaseModel):
    quote_request_id: int
    final_price_usd: float


class OrderCreateFromSourcing(BaseModel):
    sourcing_request_id: int
    unit_id: int
    final_price_usd: float
