# app/Services/AdminLogService.py
from typing import Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import AuditLog, EmailLog, WebSocketConnectionLog
from app.Schemas.admin_logs import AuditLogResponse, EmailLogResponse, WebSocketConnectionLogResponse


class AdminLogService:
    @staticmethod
    def list_email_logs(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[EmailLogResponse]:
        stmt = select(EmailLog)
        if status_filter:
            stmt = stmt.where(EmailLog.status == status_filter)
        if cursor is not None:
            stmt = stmt.where(EmailLog.id < cursor)
        stmt = stmt.order_by(EmailLog.id.desc()).limit(limit)
        rows = db.execute(stmt).scalars().all()
        return [EmailLogResponse.model_validate(r) for r in rows]

    @staticmethod
    def list_audit_logs(cursor: Optional[int], limit: int, entity_type: Optional[str], db: Session) -> list[AuditLogResponse]:
        stmt = select(AuditLog)
        if entity_type:
            stmt = stmt.where(AuditLog.entity_type == entity_type)
        if cursor is not None:
            stmt = stmt.where(AuditLog.id < cursor)
        stmt = stmt.order_by(AuditLog.id.desc()).limit(limit)
        rows = db.execute(stmt).scalars().all()
        return [AuditLogResponse.model_validate(r) for r in rows]

    @staticmethod
    def list_websocket_logs(cursor: Optional[int], limit: int, db: Session) -> list[WebSocketConnectionLogResponse]:
        stmt = select(WebSocketConnectionLog)
        if cursor is not None:
            stmt = stmt.where(WebSocketConnectionLog.id < cursor)
        stmt = stmt.order_by(WebSocketConnectionLog.id.desc()).limit(limit)
        rows = db.execute(stmt).scalars().all()
        return [WebSocketConnectionLogResponse.model_validate(r) for r in rows]
