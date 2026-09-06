# config/settings.py
# pydantic-settings, env-driven, validated at import time.
from pathlib import Path
from typing import Optional
from urllib.parse import quote_plus

from pydantic_settings import BaseSettings, SettingsConfigDict

# Backend/ — every relative path in settings resolves against this, never against the process cwd, so `uvicorn --app-dir Backend` from the repo root…
BACKEND_ROOT = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # Application
    APP_NAME: str = "M.A.S & SONS Backend"
    ENVIRONMENT: str = "development"  # development | staging | production
    DEBUG: bool = False

    # Logging — text for humans in development, json for aggregators in staging/production.
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "text"  # text | json
    LOG_TO_FILE: bool = True

    API_PREFIX: str = "/api"
    API_V0_STR: str = "/api/v0"

    # Database — assembled into DATABASE_URL below, never hard-coded elsewhere.
    DB_TYPE: str = "postgresql+psycopg"
    DB_USERNAME: str = "postgres"
    DB_PASSWORD: str = ""
    DB_HOST: str = "localhost"
    DB_PORT: str = "5432"
    DB_NAME: str = "mas_sons_development"

    # Pool sizing — read directly by config/database.py.
    DB_POOL_SIZE: int = 5
    DB_MAX_OVERFLOW: int = 5
    DB_POOL_TIMEOUT: int = 10
    DB_POOL_RECYCLE: int = 1800
    DB_STATEMENT_TIMEOUT_MS: int = 60000  # 0 disables; migrations use their own engine either way

    @property
    def DATABASE_URL(self) -> str:
        encoded_password = quote_plus(self.DB_PASSWORD)
        return f"{self.DB_TYPE}://{self.DB_USERNAME}:{encoded_password}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"

    # Redis — provisioned from day one regardless of which features use it yet (directorystructure.md's own architectural decision): rate limiting…
    REDIS_URL: Optional[str] = None

    # Auth — multi-provider (databaseschema.md §1): password, Google OAuth, magic link, all issuing the same JWT + rotating-refresh-token pair.
    SECRET_KEY: str = ""  # required in every real environment; empty fails fast, never a fake default
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    MAGIC_LINK_TOKEN_EXPIRE_MINUTES: int = 15

    GOOGLE_OAUTH_CLIENT_ID: Optional[str] = None
    GOOGLE_OAUTH_CLIENT_SECRET: Optional[str] = None

    # httpOnly cookie-based sessions alongside bearer tokens (same shape as echooo-backend's own T0-4 pattern) — Secure defaults on except in local dev.
    COOKIE_AUTH_ENABLED: bool = True
    ACCESS_TOKEN_COOKIE_NAME: str = "access_token"
    REFRESH_TOKEN_COOKIE_NAME: str = "refresh_token"
    COOKIE_SAMESITE: str = "lax"
    COOKIE_DOMAIN: Optional[str] = None

    @property
    def COOKIE_SECURE(self) -> bool:
        return self.ENVIRONMENT != "development"

    # Internal service-to-service auth (sharedinfrastructure.md §4) — guards /api/v0/internal/jobs/* against anything but Cloud Scheduler.
    INTERNAL_JOBS_SERVICE_TOKEN: str = ""

    # Email (emailsubsystem.md §2) — "console" logs instead of sending (default, zero setup for local dev); "smtp" sends for real once SMTP_* is configured.
    EMAIL_PROVIDER: str = "console"
    EMAIL_FROM_ADDRESS: str = "no-reply@masandsons.example"
    EMAIL_FROM_NAME: str = "M.A.S & SONS"
    EMAIL_MAX_PER_RECIPIENT_PER_HOUR: int = 20

    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_USE_TLS: bool = True

    # File storage (sharedinfrastructure.md, directorystructure.md's Core/Storage/) Local disk — files save under LOCAL_STORAGE_DIR and the resulting URL…
    STORAGE_PROVIDER: str = "local"
    LOCAL_STORAGE_DIR: str = str(BACKEND_ROOT / "storage" / "uploads")
    # Absolute origin the local provider prefixes onto /uploads/{key} so stored URLs work from any client (the storefront's next/image needs an absolute…
    PUBLIC_BASE_URL: str = "http://localhost:8000"

    # CORS — kept as a raw string field, not list[str].
    BACKEND_CORS_ORIGINS: str = ""

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.BACKEND_CORS_ORIGINS.split(",") if origin.strip()]

    model_config = SettingsConfigDict(case_sensitive=True, env_file=str(BACKEND_ROOT / ".env"), extra="ignore")


settings = Settings()
