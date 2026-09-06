# routes/api/v0/websocket.py
# WebSocket route (/ws/realtime) — mounted directly on the app, not under /api/v0 (websocketsubsystem.md §1).
from typing import Optional

from fastapi import APIRouter, Query, WebSocket

from app.Controllers.WebSocketController import WebSocketController

router = APIRouter(prefix="/ws", tags=["WebSocket"])


@router.websocket("/realtime")
async def websocket_realtime(websocket: WebSocket, token: Optional[str] = Query(default=None)):
    await WebSocketController.handle_connection(websocket, token)
