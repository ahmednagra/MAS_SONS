# routes/__init__.py

# Central route registration — setup_api_routes(app) is the one place main.py mounts
# routers, matching echooo-backend's own routes/__init__.py pattern.
from routes.api import health
from routes.api.v0 import auth, stock
from config.settings import settings


def setup_api_routes(app):
    """Mount every API router onto the FastAPI app.

    `health`, `auth`, and `stock` are real today — every other domain router
    (quote_requests, orders, ...) gets added here once its Controller/Service pair
    is implemented, matching the same include_router(..., prefix=settings.API_V0_STR)
    pattern.
    """
    app.include_router(health.router)
    app.include_router(auth.router, prefix=settings.API_V0_STR)
    app.include_router(stock.router, prefix=settings.API_V0_STR)
