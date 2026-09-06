# app/Controllers/WebSocketController.py
# WebSocket connection lifecycle; every DB touch runs in the threadpool on a short-lived session.
import asyncio
import uuid
from datetime import datetime, timezone
from typing import Optional

from fastapi import WebSocket, WebSocketDisconnect, status
from fastapi.concurrency import run_in_threadpool
from sqlalchemy import select

from app.Models import User, WebSocketConnectionLog
from app.Services.AuthService import AuthService
from app.Utils.Helpers import client_ip
from app.Utils.Logger import logger
from app.WebSocket.backplane import INSTANCE_ID
from app.WebSocket.constants import IDLE_TIMEOUT_SECONDS, MAX_MESSAGE_SIZE_BYTES
from app.WebSocket.manager import manager
from app.WebSocket.permissions import channels_for
from config.database import SessionLocal


def _resolve_token(websocket: WebSocket, query_token: Optional[str]) -> Optional[str]:
    subprotocol = websocket.headers.get("sec-websocket-protocol")
    if subprotocol:
        return subprotocol.split(",")[0].strip()
    if query_token:
        return query_token
    return websocket.cookies.get("access_token")


def _authenticate(token: Optional[str]) -> Optional[User]:
    if not token:
        return None
    db = SessionLocal()
    try:
        return AuthService.get_current_user(token, db)
    except Exception:
        return None
    finally:
        db.close()


def _log_connect(connection_id: uuid.UUID, user: User, ip_address: Optional[str]) -> None:
    db = SessionLocal()
    try:
        db.add(WebSocketConnectionLog(
            connection_id=connection_id, user_id=user.id,
            role="staff" if user.user_type == "staff" else "buyer",
            connected_at=datetime.now(timezone.utc), ip_address=ip_address, instance_id=INSTANCE_ID,
        ))
        db.commit()
    except Exception as e:
        logger.warning(f"WebSocket connection log insert failed: {e}")
    finally:
        db.close()


def _log_disconnect(connection_id: uuid.UUID, reason: str) -> None:
    db = SessionLocal()
    try:
        row = db.execute(
            select(WebSocketConnectionLog).where(WebSocketConnectionLog.connection_id == connection_id)
        ).scalars().first()
        if row is not None:
            row.disconnected_at = datetime.now(timezone.utc)
            row.disconnect_reason = reason
            db.commit()
    except Exception as e:
        logger.warning(f"WebSocket connection log update failed: {e}")
    finally:
        db.close()


class WebSocketController:
    @staticmethod
    async def handle_connection(websocket: WebSocket, query_token: Optional[str]) -> None:
        subprotocol = websocket.headers.get("sec-websocket-protocol")
        accepted_protocol = subprotocol.split(",")[0].strip() if subprotocol else None
        user = await run_in_threadpool(_authenticate, _resolve_token(websocket, query_token))
        if user is None:
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        await websocket.accept(subprotocol=accepted_protocol)
        connection_id = uuid.uuid4()
        for channel in channels_for(user):
            await manager.subscribe(channel, websocket)
        await run_in_threadpool(_log_connect, connection_id, user, client_ip(websocket))

        disconnect_reason = "client_close"
        try:
            while True:
                try:
                    message = await asyncio.wait_for(websocket.receive_text(), timeout=IDLE_TIMEOUT_SECONDS)
                except asyncio.TimeoutError:
                    disconnect_reason = "idle_timeout"
                    break
                if len(message.encode("utf-8")) > MAX_MESSAGE_SIZE_BYTES:
                    disconnect_reason = "error"
                    break
        except WebSocketDisconnect:
            disconnect_reason = "client_close"
        except Exception as e:
            logger.warning(f"WebSocket error for user_id={user.id}: {e}")
            disconnect_reason = "error"
        finally:
            await manager.unsubscribe_all(websocket)
            await run_in_threadpool(_log_disconnect, connection_id, disconnect_reason)
