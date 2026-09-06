# routes/__init__.py
# Central route registration — setup_api_routes(app) is the one place main.py mounts routers, matching echooo-backend's own routes/__init__.py pattern.
from routes.api import health
from routes.api.v0 import (
    auth, buyback_leads, destinations, favorites, notifications, orders,
    quote_requests, reviews, saved_searches, sourcing_requests, stock, uploads, websocket,
)
from routes.api.v0.admin import (
    buyback_leads as admin_buyback_leads, destinations as admin_destinations,
    logs as admin_logs, orders as admin_orders, reviews as admin_reviews, stock as admin_stock,
)
from routes.api.v0.internal import jobs as internal_jobs
from config.settings import settings


def setup_api_routes(app):
    """Mount every API router onto the FastAPI app."""
    app.include_router(health.router)
    app.include_router(websocket.router)  # /ws/realtime — not under /api/v0 (websocketsubsystem.md §1)

    for router in (
        auth.router, stock.router, quote_requests.router, sourcing_requests.router,
        orders.router, buyback_leads.router, destinations.router, reviews.router,
        favorites.router, saved_searches.router, notifications.router, uploads.router,
    ):
        app.include_router(router, prefix=settings.API_V0_STR)

    for router in (
        admin_stock.router, admin_orders.router, admin_reviews.router,
        admin_buyback_leads.router, admin_destinations.router, admin_logs.router,
    ):
        app.include_router(router, prefix=settings.API_V0_STR)

    app.include_router(internal_jobs.router, prefix=settings.API_V0_STR)
