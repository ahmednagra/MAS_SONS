# app/Services/Notifications/types.py
# Type registry — code, not database (notificationssubsystem.md §3).
NOTIFICATION_TYPES: dict[str, dict] = {
    "quote_request.received": {
        "category": "quote_request", "priority": "high", "applicable_recipient": "staff",
        "default_channels": {"in_app", "email"}, "email_template": "quote_requests/staff_alert",
        "retention_days": 90,
    },
    "quote_request.quoted": {
        "category": "quote_request", "priority": "high", "applicable_recipient": "buyer",
        "default_channels": {"email"}, "email_template": "quote_requests/quote_ready",
        "retention_days": 365,
    },
    "sourcing_request.received": {
        "category": "sourcing_request", "priority": "high", "applicable_recipient": "staff",
        "default_channels": {"in_app", "email"}, "email_template": "sourcing_requests/staff_alert",
        "retention_days": 90,
    },
    "sourcing_request.sourced": {
        "category": "sourcing_request", "priority": "high", "applicable_recipient": "buyer",
        "default_channels": {"in_app"}, "email_template": None, "retention_days": 365,
    },
    "buyback_lead.received": {
        "category": "buyback_lead", "priority": "normal", "applicable_recipient": "staff",
        "default_channels": {"in_app", "email"}, "email_template": "buyback_leads/staff_alert",
        "retention_days": 90,
    },
    "stock.shipment_update": {
        "category": "order", "priority": "high", "applicable_recipient": "buyer",
        "default_channels": {"email", "in_app"}, "email_template": "orders/shipment_update",
        "retention_days": 365,
    },
}


def is_known_type(notification_type: str) -> bool:
    return notification_type in NOTIFICATION_TYPES


def get_type_definition(notification_type: str) -> dict:
    return NOTIFICATION_TYPES[notification_type]
