# app/Schemas/websocket.py
# WebSocket message envelope schemas (websocketsubsystem.md §2).
from typing import Any

from pydantic import BaseModel


class WebSocketEnvelope(BaseModel):
    event_type: str
    channel: str
    payload: dict[str, Any]
