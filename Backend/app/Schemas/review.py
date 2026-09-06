# app/Schemas/review.py
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict, EmailStr, field_validator


class ReviewPhotoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    url: str
    sort_order: int


class ReviewCreate(BaseModel):
    quote_request_id: int
    reviewer_name: str
    destination_country: Optional[str] = None
    rating: Optional[int] = None
    body: str
    photo_urls: list[str] = []

    @field_validator("destination_country")
    @classmethod
    def _normalize_country_code(cls, v: Optional[str]) -> Optional[str]:
        return v.upper() if v else v


class ReviewResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: Optional[int] = None
    quote_request_id: Optional[int] = None
    unit_id: Optional[int] = None
    reviewer_name: str
    destination_country: Optional[str] = None
    rating: Optional[int] = None
    body: str
    status: str
    created_at: datetime
    photos: list[ReviewPhotoResponse] = []


class ReviewModerate(BaseModel):
    status: str


class ReviewReportCreate(BaseModel):
    reporter_email: Optional[EmailStr] = None
    reason: str


class ReviewReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    review_id: int
    reporter_email: Optional[str] = None
    reason: str
    resolved_at: Optional[datetime] = None
    created_at: datetime
