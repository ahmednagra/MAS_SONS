# app/Utils/RedisClient.py
# One Redis connection pool for RateLimiter, Idempotency, and WebSocket backplane — never a subsystem opening its own connection…
import time
from typing import Optional

import redis

from app.Utils.Logger import logger
from config.settings import settings

_client: Optional[redis.Redis] = None
_next_retry_at: float = 0.0
_RETRY_INTERVAL_SECONDS = 30.0


def get_redis() -> Optional[redis.Redis]:
    """None means degraded (unconfigured or unreachable) — every caller must treat that as fail-open, never as an error to surface to the request."""
    global _client, _next_retry_at
    if not settings.REDIS_URL:
        return None
    if _client is not None:
        return _client
    now = time.monotonic()
    if now < _next_retry_at:
        return None
    try:
        client = redis.Redis.from_url(settings.REDIS_URL, socket_connect_timeout=1, socket_timeout=1)
        client.ping()
        _client = client
        return _client
    except Exception as e:
        logger.warning(f"Redis unavailable, degrading: {e}")
        _next_retry_at = now + _RETRY_INTERVAL_SECONDS
        return None
