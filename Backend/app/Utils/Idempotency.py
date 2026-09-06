# app/Utils/Idempotency.py
# check_and_mark() — atomic SET NX EX (sharedinfrastructure.md §1).
from app.Utils.Logger import logger
from app.Utils.RedisClient import get_redis


def check_and_mark(key: str, ttl_seconds: int) -> bool:
    client = get_redis()
    if client is None:
        return True
    try:
        return bool(client.set(key, "1", nx=True, ex=ttl_seconds))
    except Exception as e:
        logger.warning(f"Idempotency degraded for key={key}: {e}")
        return True
