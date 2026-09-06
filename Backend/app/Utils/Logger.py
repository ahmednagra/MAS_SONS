# app/Utils/Logger.py
# Application logging: request-id aware text or JSON lines to console and a rotating file.
import io
import json
import logging
import sys
import time
import warnings
from contextvars import ContextVar
from datetime import datetime, timezone
from logging.handlers import RotatingFileHandler
from typing import Any, Optional

from config.settings import BACKEND_ROOT, settings

request_id_var: ContextVar[Optional[str]] = ContextVar("request_id", default=None)

_LOG_DIR = BACKEND_ROOT / "logs"
_NOISY_LOGGERS = {
    "uvicorn.access": logging.WARNING,   # replaced by RequestLoggingMiddleware's richer access line
    "sqlalchemy.engine": logging.WARNING,
    "httpx": logging.WARNING,
    "watchfiles": logging.WARNING,
}


class _ContextFilter(logging.Filter):
    """Attach the current request id so every line from one request can be grouped."""

    def filter(self, record: logging.LogRecord) -> bool:
        record.request_id = request_id_var.get() or "-"
        return True


# Access-line fields already spelled out in the message text; only JSON output repeats them as keys.
_IN_MESSAGE = {"method", "path", "status", "ms"}


class _TextFormatter(logging.Formatter):
    """Human-readable line: time level [req] logger: message key=value ..."""

    def format(self, record: logging.LogRecord) -> str:
        ts = datetime.fromtimestamp(record.created, timezone.utc).strftime("%H:%M:%S.%f")[:-3]
        extra = {k: v for k, v in _extra_fields(record).items() if k not in _IN_MESSAGE}
        tail = (" " + " ".join(f"{k}={_short(v)}" for k, v in extra.items())) if extra else ""
        line = f"{ts} {record.levelname:<7} [{record.request_id}] {record.name}: {record.getMessage()}{tail}"
        if record.exc_info:
            line += "\n" + self.formatException(record.exc_info)
        return line


class _JsonFormatter(logging.Formatter):
    """One JSON object per line for log aggregators (Cloud Logging, Loki, Datadog)."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "time": datetime.fromtimestamp(record.created, timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "request_id": record.request_id,
            "message": record.getMessage(),
            **_extra_fields(record),
        }
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, default=str)


_STANDARD_ATTRS = set(vars(logging.LogRecord("", 0, "", 0, "", (), None))) | {"request_id", "message", "asctime"}


def _extra_fields(record: logging.LogRecord) -> dict[str, Any]:
    """Fields passed via `extra=` become key=value pairs (text) or top-level keys (JSON)."""
    return {k: v for k, v in record.__dict__.items() if k not in _STANDARD_ATTRS and not k.startswith("_")}


def _short(value: Any, limit: int = 200) -> str:
    text = value if isinstance(value, str) else json.dumps(value, default=str)
    return text if len(text) <= limit else text[: limit - 1] + "…"


def _console_stream():
    if sys.platform == "win32" and hasattr(sys.stdout, "buffer"):
        return io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace", line_buffering=True)
    return sys.stdout


def _build_handlers() -> list[logging.Handler]:
    formatter = _JsonFormatter() if settings.LOG_FORMAT == "json" else _TextFormatter()
    console = logging.StreamHandler(_console_stream())
    console.setFormatter(formatter)
    handlers: list[logging.Handler] = [console]
    if settings.LOG_TO_FILE:
        _LOG_DIR.mkdir(parents=True, exist_ok=True)
        file_handler = RotatingFileHandler(
            _LOG_DIR / f"app_{time.strftime('%Y-%m-%d')}.log", maxBytes=10 * 1024 * 1024, backupCount=10, encoding="utf-8",
        )
        file_handler.setFormatter(formatter)
        handlers.append(file_handler)
    for handler in handlers:
        handler.addFilter(_ContextFilter())
    return handlers


def configure_logging() -> logging.Logger:
    """Install handlers on the app logger and route uvicorn/sqlalchemy through the same format; idempotent."""
    app_logger = logging.getLogger("mas_sons_api")
    if getattr(app_logger, "_configured", False):
        return app_logger
    level = getattr(logging, settings.LOG_LEVEL.upper(), logging.INFO)
    handlers = _build_handlers()

    app_logger.setLevel(level)
    app_logger.propagate = False
    for h in handlers:
        app_logger.addHandler(h)

    for name in ("uvicorn", "uvicorn.error"):
        lib = logging.getLogger(name)
        lib.handlers = list(handlers)
        lib.propagate = False
        lib.setLevel(level)
    for name, lib_level in _NOISY_LOGGERS.items():
        logging.getLogger(name).setLevel(lib_level)

    # Third-party version-mismatch warning from `requests` adds nothing actionable at every boot.
    warnings.filterwarnings("ignore", message=".*doesn't match a supported version.*")
    app_logger._configured = True  # type: ignore[attr-defined]
    return app_logger


logger = configure_logging()
