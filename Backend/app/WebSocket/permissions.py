# app/WebSocket/permissions.py
# Channel subscription permission checks (websocketsubsystem.md §1).
from app.Models import User
from app.WebSocket.constants import STAFF_GLOBAL_CHANNEL, user_channel


def channels_for(user: User) -> set[str]:
    channels = {user_channel(user.id)}
    if user.user_type == "staff":
        channels.add(STAFF_GLOBAL_CHANNEL)
    return channels
