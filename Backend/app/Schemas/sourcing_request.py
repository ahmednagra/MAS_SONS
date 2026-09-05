# app/Schemas/sourcing_request.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr


class SourcingRequestCreate(BaseModel):
    contact_name: str
    contact_email: EmailStr
    contact_whatsapp: Optional[str] = None
    make: Optional[str] = None
    model_description: str
    min_auction_grade: Optional[str] = None
    budget_max_usd: Optional[float] = None
    destination_country: Optional[str] = None
    quote_type: Optional[str] = None
    buying_timeframe: Optional[str] = None


class SourcingRequestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    contact_name: str
    contact_email: str
    contact_whatsapp: Optional[str] = None
    make: Optional[str] = None
    model_description: str
    min_auction_grade: Optional[str] = None
    budget_max_usd: Optional[float] = None
    destination_country: Optional[str] = None
    quote_type: Optional[str] = None
    buying_timeframe: Optional[str] = None
    status: str
    created_at: datetime


class SourcingRequestStatusUpdate(BaseModel):
    status: str
