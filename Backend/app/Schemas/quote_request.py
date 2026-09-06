# app/Schemas/quote_request.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class QuoteRequestCreate(BaseModel):
    unit_id: int
    contact_name: str
    contact_email: EmailStr
    contact_whatsapp: Optional[str] = None
    destination_country: str
    incoterm: str
    notes: Optional[str] = None

    @field_validator("destination_country")
    @classmethod
    def _normalize_country_code(cls, v: str) -> str:
        return v.upper()


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
    unit_make: Optional[str] = None
    unit_model: Optional[str] = None
    unit_year: Optional[int] = None


class QuoteRequestQuote(BaseModel):
    quoted_price_usd: float
