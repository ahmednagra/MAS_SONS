# routes/api/v0/admin/destinations.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Controllers.DestinationController import DestinationController
from app.Models import User
from app.Schemas.destination import DestinationResponse, DestinationUpsert
from app.Utils.Helpers import require_staff
from config.database import get_db

router = APIRouter(prefix="/admin/destinations", tags=["Admin - Destinations"])


@router.put("", response_model=DestinationResponse)
def upsert_destination(
    data: DestinationUpsert, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return DestinationController.upsert(data, db)
