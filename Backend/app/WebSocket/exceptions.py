# app/WebSocket/exceptions.py
# WebSocket-specific exception types.
class WebSocketAuthError(Exception):
    pass


class ChannelPermissionError(Exception):
    pass
