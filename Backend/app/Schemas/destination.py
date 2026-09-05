# app/Schemas/destination.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict


class DestinationResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    country_code: str
    country_name: str
    primary_port: str
    origin_port: str
    estimated_transit_days: Optional[int] = None
    shipping_mode: Optional[str] = None
    import_regulations_summary: Optional[str] = None


class DestinationUpsert(BaseModel):
    country_code: str
    country_name: str
    primary_port: str
    origin_port: str
    estimated_transit_days: Optional[int] = None
    shipping_mode: Optional[str] = None
    import_regulations_summary: Optional[str] = None
