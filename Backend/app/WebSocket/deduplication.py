# app/WebSocket/deduplication.py
# Broadcast dedup via Utils.Idempotency (websocketsubsystem.md §4) — the same Redis-backed check used for notification idempotency, not a separate…
import hashlib
import json
from typing import Any

from app.Utils.Idempotency import check_and_mark

DEDUP_TTL_SECONDS = 60


def should_broadcast(event_type: str, channel: str, payload: dict[str, Any]) -> bool:
    content_hash = hashlib.sha256(json.dumps(payload, sort_keys=True, default=str).encode()).hexdigest()[:16]
    key = f"ws:{event_type}:{channel}:{content_hash}"
    return check_and_mark(key, DEDUP_TTL_SECONDS)
