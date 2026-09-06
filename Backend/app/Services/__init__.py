# app/Services/__init__.py
# Single import surface for every top-level Service.

from app.Services.StockService import StockService
from app.Services.QuoteRequestService import QuoteRequestService
from app.Services.SourcingRequestService import SourcingRequestService
from app.Services.OrderService import OrderService
from app.Services.BuybackLeadService import BuybackLeadService
from app.Services.ReviewService import ReviewService
from app.Services.DestinationService import DestinationService
from app.Services.FavoriteService import FavoriteService
from app.Services.SavedSearchService import SavedSearchService
from app.Services.NotificationPreferenceService import NotificationPreferenceService
from app.Services.AdminLogService import AdminLogService
from app.Services.Notifications.NotificationService import NotificationService
from app.Services.AuthService import AuthService

__all__ = [
    "StockService", "QuoteRequestService", "SourcingRequestService", "OrderService",
    "BuybackLeadService", "ReviewService", "DestinationService", "FavoriteService",
    "SavedSearchService", "NotificationPreferenceService", "AdminLogService",
    "NotificationService", "AuthService",
]
