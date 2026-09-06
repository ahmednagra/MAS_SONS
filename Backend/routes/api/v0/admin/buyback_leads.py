# routes/api/v0/admin/buyback_leads.py
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.BuybackLeadController import BuybackLeadController
from app.Models import User
from app.Schemas.buyback_lead import BuybackLeadResponse, BuybackLeadStatusUpdate
from app.Utils.Helpers import require_staff
from config.database import get_db

router = APIRouter(prefix="/admin/buyback-leads", tags=["Admin - Buyback Leads"])


@router.get("", response_model=list[BuybackLeadResponse])
def list_buyback_leads(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100), status_filter: Optional[str] = None,
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return BuybackLeadController.list_all(cursor, limit, status_filter, db)


@router.get("/{id}", response_model=BuybackLeadResponse)
def get_buyback_lead(id: int, staff: User = Depends(require_staff), db: Session = Depends(get_db)):
    return BuybackLeadController.get_by_id(id, db)


@router.patch("/{id}/status", response_model=BuybackLeadResponse)
def update_buyback_lead_status(
    id: int, data: BuybackLeadStatusUpdate, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return BuybackLeadController.update_status(id, data, staff, db)
