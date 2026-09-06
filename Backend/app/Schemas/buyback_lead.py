# app/Schemas/buyback_lead.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class BuybackLeadPhotoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    sort_order: int


class BuybackLeadCreate(BaseModel):
    name: str
    phone: str
    vehicle_or_equipment_description: str
    photo_urls: list[str] = []


class BuybackLeadResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    phone: str
    vehicle_or_equipment_description: str
    status: str
    created_at: datetime
    photos: list[BuybackLeadPhotoResponse] = []


class BuybackLeadStatusUpdate(BaseModel):
    status: str
