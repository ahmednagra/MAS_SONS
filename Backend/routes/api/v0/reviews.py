# routes/api/v0/reviews.py
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.ReviewController import ReviewController
from app.Models import User
from app.Schemas.review import ReviewCreate, ReviewReportCreate, ReviewReportResponse, ReviewResponse
from app.Utils.Helpers import get_optional_user
from config.database import get_db

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse)
def create_review(data: ReviewCreate, db: Session = Depends(get_db), user: Optional[User] = Depends(get_optional_user)):
    return ReviewController.create(data, user, db)


@router.get("", response_model=list[ReviewResponse])
def list_reviews(
    country: Optional[str] = None, cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return ReviewController.list_approved(country, cursor, limit, db)


@router.post("/{id}/report", response_model=ReviewReportResponse)
def report_review(id: int, data: ReviewReportCreate, db: Session = Depends(get_db)):
    return ReviewController.report(id, data, db)
