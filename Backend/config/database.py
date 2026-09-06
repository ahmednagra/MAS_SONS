# config/database.py
# SQLAlchemy engine + session factory, pool sizing (directorystructure.md § connection pooling).
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from config.settings import settings

# pool_pre_ping — validate a pooled connection before handing it out, so a connection dropped by Cloud SQL (idle timeout, restart) is transparently…
_CONNECT_ARGS: dict = {}
if settings.DB_STATEMENT_TIMEOUT_MS > 0:
    # statement_timeout caps how long a SINGLE query may run.
    _CONNECT_ARGS["options"] = f"-c statement_timeout={settings.DB_STATEMENT_TIMEOUT_MS}"

# TCP keepalives — libpq connection parameters, so identical for psycopg2 and psycopg3.
_CONNECT_ARGS.update({
    "keepalives": 1,
    "keepalives_idle": 30,
    "keepalives_interval": 10,
    "keepalives_count": 5,
})

engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,
    pool_recycle=settings.DB_POOL_RECYCLE,
    connect_args=_CONNECT_ARGS,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db() -> Session:
    """FastAPI dependency — one Session per request, always closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def ensure_postgres_extensions() -> None:
    """Create every Postgres extension a Model column type depends on."""
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS citext"))
