# app/Models/__init__.py
# Single import surface for every ORM model — also what alembic/env.py imports for autogenerate.

from app.Models.base import Base
from app.Models.users import User
from app.Models.auth_identities import AuthIdentity
from app.Models.magic_link_tokens import MagicLinkToken
from app.Models.refresh_tokens import RefreshToken
from app.Models.units import Unit
from app.Models.unit_images import UnitImage
from app.Models.features import Feature
from app.Models.unit_features import UnitFeature
from app.Models.quote_requests import QuoteRequest
from app.Models.sourcing_requests import SourcingRequest
from app.Models.orders import Order
from app.Models.order_fulfillment_details import OrderFulfillmentDetail
from app.Models.buyback_leads import BuybackLead
from app.Models.buyback_lead_photos import BuybackLeadPhoto
from app.Models.favorites import Favorite
from app.Models.saved_searches import SavedSearch
from app.Models.reviews import Review
from app.Models.review_photos import ReviewPhoto
from app.Models.review_reports import ReviewReport
from app.Models.destinations import Destination
from app.Models.websocket_connection_log import WebSocketConnectionLog
from app.Models.notifications import Notification
from app.Models.notification_preferences import NotificationPreference
from app.Models.email_logs import EmailLog
from app.Models.audit_logs import AuditLog

__all__ = ["Base", "User", "AuthIdentity", "MagicLinkToken", "RefreshToken", "Unit", "UnitImage", "Feature", "UnitFeature", "QuoteRequest", "SourcingRequest", "Order", "OrderFulfillmentDetail", "BuybackLead", "BuybackLeadPhoto", "Favorite", "SavedSearch", "Review", "ReviewPhoto", "ReviewReport", "Destination", "WebSocketConnectionLog", "Notification", "NotificationPreference", "EmailLog", "AuditLog"]
