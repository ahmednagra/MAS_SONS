# main.py

# FastAPI app entrypoint. Mirrors echooo-backend's main.py bootstrap approach exactly,
# per explicit project decision: Base.metadata.create_all(checkfirst=True) creates every
# table on first startup and is a no-op against an existing database; the seed data in
# app/Utils/dictionaries/ loads right after. Alembic (alembic/versions/, still empty) is
# reserved for schema CHANGES to an already-running database — altering an existing
# table, not the first-time creation this lifespan already handles.
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.database import get_db, engine, ensure_postgres_extensions
from app.Models import Base
from app.Utils.Logger import logger
from app.Utils.db_init import initialize_all_default_data
from routes import setup_api_routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: provision required Postgres extensions, create any table that doesn't
    # exist yet, then seed default data. checkfirst=True (the default) makes create_all
    # safe to run on every boot — it never touches a table that's already there, so it
    # neither drops data nor conflicts with a later Alembic-managed ALTER.
    ensure_postgres_extensions()
    Base.metadata.create_all(bind=engine, checkfirst=True)
    logger.info(f"{settings.APP_NAME} starting up...")

    db = next(get_db())
    try:
        initialize_all_default_data(db)
    finally:
        db.close()

    yield

    logger.info(f"{settings.APP_NAME} shutting down...")


app = FastAPI(
    title=settings.APP_NAME,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

setup_api_routes(app)
