# app/Schemas/notification_preference.py
from datetime import time
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class NotificationPreferenceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    channel_preferences: dict[str, Any]
    is_email_paused: bool
    marketing_opt_in: bool
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None
    timezone: str
    digest_frequency: str


class NotificationPreferenceUpdate(BaseModel):
    channel_preferences: Optional[dict[str, Any]] = None
    is_email_paused: Optional[bool] = None
    marketing_opt_in: Optional[bool] = None
    quiet_hours_start: Optional[time] = None
    quiet_hours_end: Optional[time] = None
    timezone: Optional[str] = None
    digest_frequency: Optional[str] = None
