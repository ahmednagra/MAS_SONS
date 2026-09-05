# app/Schemas/quote_request.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class QuoteRequestCreate(BaseModel):
    unit_id: int
    contact_name: str
    contact_email: EmailStr
    contact_whatsapp: Optional[str] = None
    destination_country: str
    incoterm: str
    notes: Optional[str] = None


class QuoteRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    user_id: Optional[int] = None
    contact_name: str
    contact_email: str
    contact_whatsapp: Optional[str] = None
    destination_country: str
    incoterm: str
    status: str
    quoted_price_usd: Optional[float] = None
    quoted_at: Optional[datetime] = None
    notes: Optional[str] = None
    created_at: datetime


class QuoteRequestQuote(BaseModel):
    quoted_price_usd: float
