# routes/api/v0/destinations.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Controllers.DestinationController import DestinationController
from app.Schemas.destination import DestinationResponse
from config.database import get_db

router = APIRouter(prefix="/destinations", tags=["Destinations"])


@router.get("", response_model=list[DestinationResponse])
def list_destinations(db: Session = Depends(get_db)):
    return DestinationController.list_all(db)


@router.get("/{country_code}", response_model=DestinationResponse)
def get_destination(country_code: str, db: Session = Depends(get_db)):
    return DestinationController.get_by_country(country_code, db)
