# app/Controllers/admin/AdminLogController.py
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Schemas.admin_logs import AuditLogResponse, EmailLogResponse, WebSocketConnectionLogResponse
from app.Services.AdminLogService import AdminLogService
from app.Utils.Logger import logger


class AdminLogController:
    @staticmethod
    def list_email_logs(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[EmailLogResponse]:
        try:
            return AdminLogService.list_email_logs(cursor, limit, status_filter, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_email_logs: {e}")
            raise

    @staticmethod
    def list_audit_logs(cursor: Optional[int], limit: int, entity_type: Optional[str], db: Session) -> list[AuditLogResponse]:
        try:
            return AdminLogService.list_audit_logs(cursor, limit, entity_type, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_audit_logs: {e}")
            raise

    @staticmethod
    def list_websocket_logs(cursor: Optional[int], limit: int, db: Session) -> list[WebSocketConnectionLogResponse]:
        try:
            return AdminLogService.list_websocket_logs(cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_websocket_logs: {e}")
            raise
