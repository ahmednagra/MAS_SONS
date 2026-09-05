# config/database.py

# SQLAlchemy engine + session factory, pool sizing (directorystructure.md § connection pooling).
# Sync Session throughout — never AsyncSession (codingconventions.md §3, echooo-backend's own
# CLAUDE.md rule). Base lives in app/Models/base.py, not here — one Base, so
# Base.metadata sees every table through app/Models/__init__.py's single import surface;
# echooo-backend defines a second Base in this file too, which this project deliberately
# does not repeat.
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker, Session

from config.settings import settings

# pool_pre_ping   — validate a pooled connection before handing it out, so a connection
#                   dropped by Cloud SQL (idle timeout, restart) is transparently
#                   replaced instead of raising mid-request.
# pool_recycle    — proactively recycle connections older than DB_POOL_RECYCLE seconds
#                   to avoid server-side idle disconnects.
# pool_timeout    — fail fast when the pool is exhausted instead of blocking the
#                   request for SQLAlchemy's 30s default.
#
# Worst-case connection budget: max Cloud Run instances × (DB_POOL_SIZE + DB_MAX_OVERFLOW)
# must stay under Cloud SQL max_connections, with headroom for Alembic/admin sessions —
# verify per environment/tier rather than assuming the defaults hold (shared-core tiers
# allow far fewer connections than a comfortable-looking multiplication suggests).
_CONNECT_ARGS: dict = {}
if settings.DB_STATEMENT_TIMEOUT_MS > 0:
    # statement_timeout caps how long a SINGLE query may run. pool_timeout only bounds
    # ACQUIRING a connection — it does nothing once one is held. Without this, one slow
    # query holds its pooled connection until the platform kills the request, and enough
    # of those stall every endpoint that touches the database together.
    _CONNECT_ARGS["options"] = f"-c statement_timeout={settings.DB_STATEMENT_TIMEOUT_MS}"

# TCP keepalives — libpq connection parameters, so identical for psycopg2 and psycopg3.
# A connection idle long enough gets closed somewhere along the path (Cloud SQL, or the
# network) with no notice; the next statement on it then fails with a dead-socket error.
# Keepalives hold the socket open through those gaps — defence in depth, not a substitute
# for not sitting idle holding a connection during a slow external call in the first place.
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
    """Create every Postgres extension a Model column type depends on.

    CITEXT (case-insensitive text — users.email, quote_requests.contact_email, etc.,
    per databaseschema.md's own convention) is a contrib extension, not a built-in
    type: CREATE TABLE fails with 'type "citext" does not exist' against a fresh
    database until this has run once. Must run before Base.metadata.create_all() —
    discovered by actually running create_all() against a real database, not by
    compiling DDL text against the dialect alone, which never touches the extension
    catalog and so cannot catch this class of gap.
    """
    with engine.begin() as conn:
        conn.execute(text("CREATE EXTENSION IF NOT EXISTS citext"))
