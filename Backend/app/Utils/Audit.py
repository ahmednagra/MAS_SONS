# app/Utils/Audit.py
# record() — one audit_logs row per audited action (databaseschema.md §10).
from typing import Any, Optional

from sqlalchemy.orm import Session

from app.Models import AuditLog
from app.Utils.Net import safe_ip


def record(
    db: Session, *, entity_type: str, entity_id: int, action: str, actor_type: str,
    actor_user_id: Optional[int] = None, changed_fields: Optional[dict[str, Any]] = None,
    ip_address: Optional[str] = None,
) -> None:
    db.add(AuditLog(
        entity_type=entity_type, entity_id=entity_id, action=action,
        actor_type=actor_type, actor_user_id=actor_user_id,
        changed_fields=changed_fields, ip_address=safe_ip(ip_address),
    ))
