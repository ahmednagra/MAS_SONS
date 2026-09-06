# routes/api/v0/internal/jobs.py
# rotate-partitions, purge-expired-notifications — service-token guarded, never reachable from a browser (sharedinfrastructure.md §4).
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.Services.Notifications.NotificationCleanupService import NotificationCleanupService
from app.Utils.partitioning import (
    PARTITIONED_TABLES, create_next_partition, drop_expired_partitions, get_retention_months,
)
from app.Utils.service_auth import verify_service_token
from config.database import engine, get_db

router = APIRouter(prefix="/internal/jobs", tags=["Internal Jobs"], dependencies=[Depends(verify_service_token)])


class RotatePartitionsRequest(BaseModel):
    table: str


@router.post("/rotate-partitions")
def rotate_partitions(data: RotatePartitionsRequest):
    if data.table not in PARTITIONED_TABLES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unknown table")
    created = create_next_partition(engine, data.table)
    retention_months = get_retention_months(data.table)
    dropped = drop_expired_partitions(engine, data.table, retention_months) if retention_months else []
    return {"created": created, "dropped": dropped}


@router.post("/purge-expired-notifications")
def purge_expired_notifications(db: Session = Depends(get_db)):
    return {"deleted": NotificationCleanupService.purge_expired(db)}
