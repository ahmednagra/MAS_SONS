# app/Utils/RateLimiter.py
# Redis-backed sliding-window counter (sharedinfrastructure.md §1).
from app.Utils.Logger import logger
from app.Utils.RedisClient import get_redis


def check_and_increment(key: str, window_seconds: int, limit: int) -> bool:
    client = get_redis()
    if client is None:
        return True
    try:
        count = client.incr(key)
        if count == 1:
            client.expire(key, window_seconds)
        return count <= limit
    except Exception as e:
        logger.warning(f"RateLimiter degraded for key={key}: {e}")
        return True
