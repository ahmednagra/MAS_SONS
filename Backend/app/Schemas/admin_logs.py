# app/Schemas/admin_logs.py
from datetime import datetime
from typing import Any, Optional
from pydantic import BaseModel, ConfigDict


class EmailLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    to_email: str
    template_name: str
    subject: str
    provider: str
    status: str
    error_code: Optional[str] = None
    error_message: Optional[str] = None
    attempts: int
    created_at: datetime


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    entity_type: str
    entity_id: int
    action: str
    changed_fields: Optional[dict[str, Any]] = None
    actor_type: str
    actor_user_id: Optional[int] = None
    created_at: datetime


class WebSocketConnectionLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    connection_id: str
    user_id: Optional[int] = None
    role: str
    connected_at: datetime
    disconnected_at: Optional[datetime] = None
    disconnect_reason: Optional[str] = None
    instance_id: str
