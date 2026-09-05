# app/Schemas/saved_search.py
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class SavedSearchCreate(BaseModel):
    name: Optional[str] = None
    filters: dict[str, Any]
    alert_enabled: bool = True


class SavedSearchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: Optional[str] = None
    filters: dict[str, Any]
    alert_enabled: bool
    last_notified_at: Optional[datetime] = None
    created_at: datetime


class SavedSearchUpdate(BaseModel):
    name: Optional[str] = None
    filters: Optional[dict[str, Any]] = None
    alert_enabled: Optional[bool] = None
