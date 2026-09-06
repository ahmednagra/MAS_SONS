# app/Services/ReviewService.py
# Review lifecycle: guest/buyer create, moderation, public listing, abuse reports.
from datetime import datetime, timezone
from typing import Optional, Sequence

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import QuoteRequest, Review, ReviewPhoto, ReviewReport, User
from app.Schemas.review import (
    ReviewCreate, ReviewModerate, ReviewPhotoResponse, ReviewReportCreate, ReviewReportResponse,
    ReviewResponse,
)
from app.Utils.Query import children_by_parent, get_live, keyset_page, to_schema


class ReviewService:
    @staticmethod
    def create(data: ReviewCreate, user: Optional[User], db: Session) -> ReviewResponse:
        quote = get_live(db, QuoteRequest, data.quote_request_id, "Quote request not found")
        row = Review(
            user_id=user.id if user else quote.user_id,
            quote_request_id=quote.id,
            unit_id=quote.unit_id,
            reviewer_name=data.reviewer_name,
            destination_country=data.destination_country or quote.destination_country,
            rating=data.rating,
            body=data.body,
        )
        db.add(row)
        db.flush()
        db.add_all(ReviewPhoto(review_id=row.id, url=url, sort_order=i) for i, url in enumerate(data.photo_urls))
        db.commit()
        db.refresh(row)
        return ReviewService._to_responses([row], db)[0]

    @staticmethod
    def _to_responses(rows: Sequence[Review], db: Session) -> list[ReviewResponse]:
        """Serialize a page with one batched photo query instead of one per review."""
        photos = children_by_parent(db, ReviewPhoto, ReviewPhoto.review_id, [r.id for r in rows], ReviewPhoto.sort_order)
        return [
            to_schema(ReviewResponse, row, photos=[ReviewPhotoResponse.model_validate(p) for p in photos.get(row.id, [])])
            for row in rows
        ]

    @staticmethod
    def list_approved(country: Optional[str], cursor: Optional[int], limit: int, db: Session) -> list[ReviewResponse]:
        stmt = select(Review).where(Review.status == "approved", Review.deleted_at.is_(None))
        if country:
            stmt = stmt.where(Review.destination_country == country)
        rows = db.execute(keyset_page(stmt, Review.id, cursor, limit)).scalars().all()
        return ReviewService._to_responses(rows, db)

    @staticmethod
    def list_pending(cursor: Optional[int], limit: int, db: Session) -> list[ReviewResponse]:
        stmt = select(Review).where(Review.status == "pending", Review.deleted_at.is_(None))
        rows = db.execute(keyset_page(stmt, Review.id, cursor, limit)).scalars().all()
        return ReviewService._to_responses(rows, db)

    @staticmethod
    def moderate(id: int, data: ReviewModerate, staff: User, db: Session) -> ReviewResponse:
        row = get_live(db, Review, id, "Review not found")
        row.status = data.status
        row.moderated_by_user_id = staff.id
        row.moderated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(row)
        return ReviewService._to_responses([row], db)[0]

    @staticmethod
    def report(review_id: int, data: ReviewReportCreate, db: Session) -> ReviewReportResponse:
        get_live(db, Review, review_id, "Review not found")
        row = ReviewReport(review_id=review_id, reporter_email=data.reporter_email, reason=data.reason)
        db.add(row)
        db.commit()
        db.refresh(row)
        return ReviewReportResponse.model_validate(row)
