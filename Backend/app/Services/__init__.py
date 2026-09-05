# app/Services/__init__.py

# Single import surface for every top-level Service. Only lists what's actually
# implemented — a Service stub file has no class defined yet, so importing it here
# before it's built would break this whole package's import. Uncomment each line
# as its Service is implemented.

from app.Services.StockService import StockService
# from app.Services.QuoteRequestService import QuoteRequestService
# from app.Services.SourcingRequestService import SourcingRequestService
# from app.Services.OrderService import OrderService
# from app.Services.BuybackLeadService import BuybackLeadService
# from app.Services.ReviewService import ReviewService
# from app.Services.DestinationService import DestinationService
# from app.Services.FavoriteService import FavoriteService
# from app.Services.SavedSearchService import SavedSearchService
from app.Services.AuthService import AuthService

__all__ = ["StockService", "AuthService"]
