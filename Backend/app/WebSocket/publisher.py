# app/WebSocket/publisher.py
# publish() — local delivery + backplane broadcast (websocketsubsystem.md §3).
import asyncio
from typing import Any, Optional

from app.Utils.Logger import logger
from app.Utils.Results import OperationResult
from app.WebSocket.backplane import publish_to_backplane
from app.WebSocket.deduplication import should_broadcast
from app.WebSocket.manager import manager

_main_loop: Optional[asyncio.AbstractEventLoop] = None


def set_main_loop(loop: asyncio.AbstractEventLoop) -> None:
    global _main_loop
    _main_loop = loop


def publish(event_type: str, channel: str, payload: dict[str, Any]) -> OperationResult:
    envelope = {"event_type": event_type, "channel": channel, "payload": payload}
    if not should_broadcast(event_type, channel, payload):
        return OperationResult(success=True, extra={"deduped": True})

    delivered_local = 0
    if _main_loop is not None:
        try:
            future = asyncio.run_coroutine_threadsafe(manager.local_deliver(channel, envelope), _main_loop)
            delivered_local = future.result(timeout=2)
        except Exception as e:
            logger.warning(f"WebSocket local delivery failed: {e}")

    backplane_ok = publish_to_backplane(channel, envelope)
    return OperationResult(success=True, extra={"delivered_local": delivered_local, "backplane": backplane_ok})
