# routes/api/v0/admin/reviews.py
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.admin.AdminReviewController import AdminReviewController
from app.Models import User
from app.Schemas.review import ReviewModerate, ReviewResponse
from app.Utils.Helpers import require_staff
from config.database import get_db

router = APIRouter(prefix="/admin/reviews", tags=["Admin - Reviews"])


@router.get("/pending", response_model=list[ReviewResponse])
def list_pending_reviews(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminReviewController.list_pending(cursor, limit, db)


@router.patch("/{id}/moderate", response_model=ReviewResponse)
def moderate_review(
    id: int, data: ReviewModerate, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminReviewController.moderate(id, data, staff, db)
