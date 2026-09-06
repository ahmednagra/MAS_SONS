# routes/api/v0/quote_requests.py
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.QuoteRequestController import QuoteRequestController
from app.Models import User
from app.Schemas.quote_request import QuoteRequestCreate, QuoteRequestQuote, QuoteRequestResponse
from app.Utils.Helpers import get_current_user, get_optional_user, require_staff
from config.database import get_db

router = APIRouter(prefix="/quote-requests", tags=["Quote Requests"])


@router.post("", response_model=QuoteRequestResponse)
def create_quote_request(
    data: QuoteRequestCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_optional_user),
):
    return QuoteRequestController.create(data, user, db, background_tasks)


@router.get("", response_model=list[QuoteRequestResponse])
def list_my_quote_requests(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return QuoteRequestController.list_mine(current_user, cursor, limit, db)


@router.get("/{id}", response_model=QuoteRequestResponse)
def get_quote_request(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return QuoteRequestController.get_by_id(id, current_user, db)


@router.post("/{id}/quote", response_model=QuoteRequestResponse)
def quote_request_price(
    id: int, data: QuoteRequestQuote, background_tasks: BackgroundTasks,
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return QuoteRequestController.quote(id, data, staff, db, background_tasks)
