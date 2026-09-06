# routes/api/v0/buyback_leads.py
from fastapi import APIRouter, BackgroundTasks, Depends
from sqlalchemy.orm import Session

from app.Controllers.BuybackLeadController import BuybackLeadController
from app.Schemas.buyback_lead import BuybackLeadCreate, BuybackLeadResponse
from config.database import get_db

router = APIRouter(prefix="/buyback-leads", tags=["Buyback Leads"])


@router.post("", response_model=BuybackLeadResponse)
def create_buyback_lead(data: BuybackLeadCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    return BuybackLeadController.create(data, db, background_tasks)
