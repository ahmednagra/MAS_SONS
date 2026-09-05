# app/Schemas/favorite.py
from datetime import datetime
from pydantic import BaseModel, ConfigDict


class FavoriteCreate(BaseModel):
    unit_id: int


class FavoriteResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    unit_id: int
    created_at: datetime
