# routes/api/v0/admin/logs.py
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.admin.AdminLogController import AdminLogController
from app.Models import User
from app.Schemas.admin_logs import AuditLogResponse, EmailLogResponse, WebSocketConnectionLogResponse
from app.Utils.Helpers import require_staff
from config.database import get_db

router = APIRouter(prefix="/admin/logs", tags=["Admin - Logs"])


@router.get("/emails", response_model=list[EmailLogResponse])
def list_email_logs(
    cursor: Optional[int] = None, limit: int = Query(50, ge=1, le=100), status_filter: Optional[str] = None,
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminLogController.list_email_logs(cursor, limit, status_filter, db)


@router.get("/audit", response_model=list[AuditLogResponse])
def list_audit_logs(
    cursor: Optional[int] = None, limit: int = Query(50, ge=1, le=100), entity_type: Optional[str] = None,
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminLogController.list_audit_logs(cursor, limit, entity_type, db)


@router.get("/websocket", response_model=list[WebSocketConnectionLogResponse])
def list_websocket_logs(
    cursor: Optional[int] = None, limit: int = Query(50, ge=1, le=100),
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminLogController.list_websocket_logs(cursor, limit, db)
