# app/WebSocket/backplane.py
# Redis pub/sub cross-instance fan-out (websocketsubsystem.md §3).
import asyncio
import json
import threading
import uuid
from typing import Awaitable, Callable

from app.Utils.Logger import logger
from app.Utils.RedisClient import get_redis
from app.WebSocket.constants import REDIS_PUBSUB_CHANNEL

INSTANCE_ID = str(uuid.uuid4())
_listener_started = False
_lock = threading.Lock()


def publish_to_backplane(channel: str, payload: dict) -> bool:
    client = get_redis()
    if client is None:
        return False
    try:
        client.publish(REDIS_PUBSUB_CHANNEL, json.dumps({"origin": INSTANCE_ID, "channel": channel, "payload": payload}))
        return True
    except Exception as e:
        logger.warning(f"WebSocket backplane publish failed: {e}")
        return False


def start_backplane_listener(
    loop: asyncio.AbstractEventLoop, on_message: Callable[[str, dict], Awaitable[None]],
) -> None:
    global _listener_started
    with _lock:
        if _listener_started:
            return
        client = get_redis()
        if client is None:
            logger.info("WebSocket backplane: Redis unavailable, running local-only")
            return
        _listener_started = True

    def _run() -> None:
        pubsub = client.pubsub()
        pubsub.subscribe(REDIS_PUBSUB_CHANNEL)
        for message in pubsub.listen():
            if message.get("type") != "message":
                continue
            try:
                data = json.loads(message["data"])
                if data.get("origin") == INSTANCE_ID:
                    continue
                asyncio.run_coroutine_threadsafe(on_message(data["channel"], data["payload"]), loop)
            except Exception as e:
                logger.warning(f"WebSocket backplane message error: {e}")

    threading.Thread(target=_run, daemon=True, name="ws-backplane-listener").start()
