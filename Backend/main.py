# main.py
# FastAPI app entrypoint.
import asyncio
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config.settings import settings
from config.database import get_db, engine, ensure_postgres_extensions
from app.Middleware.error_handlers import register_error_handlers
from app.Middleware.request_logging import RequestLoggingMiddleware
from app.Models import Base
from app.Utils.Logger import logger
from app.Utils.db_init import initialize_all_default_data
from app.Utils.partitioning import ensure_all_partitions, ensure_partitioned_tables
from app.WebSocket.backplane import start_backplane_listener
from app.WebSocket.manager import manager
from app.WebSocket.publisher import set_main_loop
from routes import setup_api_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: provision required Postgres extensions, create any table that doesn't exist yet, then seed default data.
    ensure_postgres_extensions()
    ensure_partitioned_tables(engine)
    Base.metadata.create_all(bind=engine, checkfirst=True)
    ensure_all_partitions(engine)
    logger.info(
        f"{settings.APP_NAME} starting",
        extra={
            "env": settings.ENVIRONMENT, "db": f"{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}",
            "storage": settings.STORAGE_PROVIDER, "log_format": settings.LOG_FORMAT,
            "cors_origins": len(settings.cors_origins), "redis": "configured" if settings.REDIS_URL else "off",
        },
    )

    db = next(get_db())
    try:
        initialize_all_default_data(db)
    finally:
        db.close()

    set_main_loop(asyncio.get_running_loop())
    start_backplane_listener(asyncio.get_running_loop(), manager.local_deliver)

    yield

    logger.info(f"{settings.APP_NAME} shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

register_error_handlers(app)
app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_api_routes(app)

if settings.STORAGE_PROVIDER == "local":
    import os

    os.makedirs(settings.LOCAL_STORAGE_DIR, exist_ok=True)
    app.mount("/uploads", StaticFiles(directory=settings.LOCAL_STORAGE_DIR), name="uploads")
