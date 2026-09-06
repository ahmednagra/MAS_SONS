# app/WebSocket/events/__init__.py
# Four event types, sized to what this business actually has happening in real time.
from enum import Enum


class EventType(str, Enum):
    QUOTE_REQUEST_RECEIVED = "quote_request.received"
    QUOTE_REQUEST_STATUS_CHANGED = "quote_request.status_changed"
    SOURCING_REQUEST_RECEIVED = "sourcing_request.received"
    BUYBACK_LEAD_RECEIVED = "buyback_lead.received"
