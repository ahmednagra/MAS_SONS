# app/WebSocket/constants.py
# WebSocket-related constants (channel names, timeouts, size caps).
IDLE_TIMEOUT_SECONDS = 60
MAX_MESSAGE_SIZE_BYTES = 100_000
REDIS_PUBSUB_CHANNEL = "ws:broadcast"
STAFF_GLOBAL_CHANNEL = "staff:global"


def user_channel(user_id: int) -> str:
    return f"user:{user_id}"
