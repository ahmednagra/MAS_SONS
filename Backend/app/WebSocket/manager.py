# app/WebSocket/manager.py
# ConnectionManager — in-memory registry, per-instance (websocketsubsystem.md §1).
import asyncio
from collections import defaultdict
from typing import Any

from fastapi import WebSocket

from app.Utils.Logger import logger


class ConnectionManager:
    def __init__(self) -> None:
        self._channels: dict[str, set[WebSocket]] = defaultdict(set)
        self._lock = asyncio.Lock()

    async def subscribe(self, channel: str, ws: WebSocket) -> None:
        async with self._lock:
            self._channels[channel].add(ws)

    async def unsubscribe_all(self, ws: WebSocket) -> None:
        async with self._lock:
            for conns in self._channels.values():
                conns.discard(ws)

    async def local_deliver(self, channel: str, payload: dict[str, Any]) -> int:
        conns = list(self._channels.get(channel, ()))
        delivered = 0
        for ws in conns:
            try:
                await ws.send_json(payload)
                delivered += 1
            except Exception as e:
                logger.warning(f"WebSocket local delivery failed on channel {channel}: {e}")
                async with self._lock:
                    self._channels[channel].discard(ws)
        return delivered


manager = ConnectionManager()
