# config/settings.py

# pydantic-settings, env-driven, validated at import time. Lean by design — this is a
# nine-domain backend (directorystructure.md), not a sprawling platform; fields are
# added when a real call site needs them, not speculatively.
from typing import Optional
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # -----------------------------------------------------------------------
    # Application
    # -----------------------------------------------------------------------
    APP_NAME: str = "M.A.S & SONS Backend"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = False

    API_PREFIX: str = "/api"
    API_V0_STR: str = "/api/v0"

    # -----------------------------------------------------------------------
    # Database — assembled into DATABASE_URL below, never hard-coded elsewhere.
    # No plausible-looking default password: a missing DB_PASSWORD must fail
    # loudly at startup, not silently connect to nothing with a fake credential.
    # -----------------------------------------------------------------------
    DB_TYPE: str = "postgresql+psycopg"
    DB_USERNAME: str = "postgres"
    DB_PASSWORD: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "mas_sons_development"

    # Pool sizing — read directly by config/database.py. Per-process budget:
    # each Cloud Run instance opens up to (DB_POOL_SIZE + DB_MAX_OVERFLOW)
    # connections, so worst case is max_instances × that sum, which must stay
    # under Cloud SQL max_connections (directorystructure.md's connection-
    # pooling section) — verify per environment/tier rather than assuming.
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 5
    DB_POOL_TIMEOUT: int = 10
    DB_POOL_RECYCLE: int = 1800
    DB_STATEMENT_TIMEOUT_MS: int = 60000  # 0 disables; migrations use their own engine either way

    @property
    def DATABASE_URL(self) -> str:
        encoded_password = quote_plus(self.DB_PASSWORD)
        return f"{self.DB_TYPE}://{self.DB_USERNAME}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # -----------------------------------------------------------------------
    # Redis — provisioned from day one regardless of which features use it yet
    # (directorystructure.md's own architectural decision): rate limiting,
    # idempotency, and WebSocket cross-instance fan-out all share this.
    # -----------------------------------------------------------------------
    REDIS_URL: Optional[str] = None

    # -----------------------------------------------------------------------
    # Auth — multi-provider (databaseschema.md §1): password, Google OAuth,
    # magic link, all issuing the same JWT + rotating-refresh-token pair.
    # -----------------------------------------------------------------------
    SECRET_KEY: str = ""  # required in every real environment; empty fails fast, never a fake default
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    MAGIC_LINK_TOKEN_EXPIRE_MINUTES: int = 15

    GOOGLE_OAUTH_CLIENT_ID: Optional[str] = None
    GOOGLE_OAUTH_CLIENT_SECRET: Optional[str] = None

    # httpOnly cookie-based sessions alongside bearer tokens (same shape as
    # echooo-backend's own T0-4 pattern) — Secure defaults on except in local dev.
    COOKIE_AUTH_ENABLED: bool = True
    ACCESS_TOKEN_COOKIE_NAME: str = "access_token"
    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: Optional[str] = None

    @property
    def COOKIE_SECURE(self) -> bool:
        return self.ENVIRONMENT != "development"

    # -----------------------------------------------------------------------
    # Internal service-to-service auth (sharedinfrastructure.md §4) — guards
    # /api/v0/internal/jobs/* against anything but Cloud Scheduler.
    # -----------------------------------------------------------------------
    INTERNAL_JOBS_SERVICE_TOKEN: str = ""

    # -----------------------------------------------------------------------
    # CORS — kept as a raw string field, not list[str]. pydantic-settings
    # JSON-decodes any complex-typed (list/dict) env field before a validator
    # ever runs, so a plain comma-separated value (BACKEND_CORS_ORIGINS=a,b)
    # raises a SettingsError outright rather than reaching a "before" validator.
    # A raw string plus a computed property sidesteps that entirely.
    # -----------------------------------------------------------------------
    BACKEND_CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=".env", extra="ignore")


settings = Settings()
