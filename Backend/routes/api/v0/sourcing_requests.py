# routes/api/v0/sourcing_requests.py
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.SourcingRequestController import SourcingRequestController
from app.Models import User
from app.Schemas.sourcing_request import (
    SourcingRequestCreate, SourcingRequestResponse, SourcingRequestStatusUpdate,
)
from app.Utils.Helpers import get_current_user, get_optional_user, require_staff
from config.database import get_db

router = APIRouter(prefix="/sourcing-requests", tags=["Sourcing Requests"])


@router.post("", response_model=SourcingRequestResponse)
def create_sourcing_request(
    data: SourcingRequestCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    return SourcingRequestController.create(data, user, db, background_tasks)


@router.get("", response_model=list[SourcingRequestResponse])
def list_my_sourcing_requests(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return SourcingRequestController.list_mine(current_user, cursor, limit, db)


@router.get("/{id}", response_model=SourcingRequestResponse)
def get_sourcing_request(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SourcingRequestController.get_by_id(id, current_user, db)


@router.patch("/{id}/status", response_model=SourcingRequestResponse)
def update_sourcing_request_status(
    id: int, data: SourcingRequestStatusUpdate, background_tasks: BackgroundTasks,
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return SourcingRequestController.update_status(id, data, staff, db, background_tasks)
