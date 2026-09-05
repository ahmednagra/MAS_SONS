# app/Services/StockService.py

# Stock catalog business logic (databaseschema.md §2). Raises HTTPException
# directly for domain errors — always called inside a request (codingconventions.md §3).
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.Models import Unit, UnitFeature, UnitImage
from app.Schemas.stock import (
    FacetCount, FeatureResponse, StockCountResponse, StockFacetsResponse,
    StockListResponse, StockSearchParams, UnitImageResponse, UnitResponse,
    UnitSummaryResponse,
)

# Browse-by-make / body-type tiles are a fixed-size UI element, not a paginated
# list — cap the GROUP BY output rather than shipping every distinct value.
FACET_MAKES_LIMIT = 12
FACET_BODY_TYPES_LIMIT = 10


class StockService:
    @staticmethod
    def search(params: StockSearchParams, db: Session) -> StockListResponse:
        stmt = select(Unit).where(Unit.deleted_at.is_(None))

        # Every filter here maps to one of units' own indexed columns
        # (idx_units_status_category, idx_units_make_model, idx_units_grade,
        # idx_units_price) — a filter with no matching index doesn't belong here
        # without adding one first (codingconventions.md §6).
        if params.category:
            stmt = stmt.where(Unit.category == params.category)
        if params.body_type:
            stmt = stmt.where(Unit.body_type == params.body_type)
        if params.make:
            stmt = stmt.where(Unit.make == params.make)
        if params.model:
            stmt = stmt.where(Unit.model == params.model)
        if params.year_min is not None:
            stmt = stmt.where(Unit.year >= params.year_min)
        if params.year_max is not None:
            stmt = stmt.where(Unit.year <= params.year_max)
        if params.price_min is not None:
            stmt = stmt.where(Unit.price_usd >= params.price_min)
        if params.price_max is not None:
            stmt = stmt.where(Unit.price_usd <= params.price_max)
        if params.mileage_max_km is not None:
            stmt = stmt.where(Unit.mileage_km <= params.mileage_max_km)
        if params.auction_grade_min:
            # auction_grade is an ordered ranking stored as text ('5' best ... 'RA'
            # worst) — not lexically sortable, so "at least this grade" is a small
            # explicit rank map rather than a string comparison.
            rank = {"5": 6, "4.5": 5, "4": 4, "3.5": 3, "3": 2, "R": 1, "RA": 0}
            min_rank = rank.get(params.auction_grade_min, 0)
            acceptable = [g for g, r in rank.items() if r >= min_rank]
            stmt = stmt.where(Unit.auction_grade.in_(acceptable))
        if params.steering_position:
            stmt = stmt.where(Unit.steering_position == params.steering_position)
        if params.fuel_type:
            stmt = stmt.where(Unit.fuel_type == params.fuel_type)
        if params.transmission:
            stmt = stmt.where(Unit.transmission == params.transmission)
        if params.keyword:
            # Free-text search: units.search_vector (a GIN-indexed generated tsvector
            # column, databaseschema.md §2) is the real full-text path once the
            # database that column is generated in is reachable through raw SQL;
            # the ORM-level ILIKE fallback here covers make/model until that's wired.
            pattern = f"%{params.keyword}%"
            stmt = stmt.where(or_(Unit.make.ilike(pattern), Unit.model.ilike(pattern), Unit.description.ilike(pattern)))

        if params.cursor is not None:
            stmt = stmt.where(Unit.id < params.cursor)

        stmt = stmt.order_by(Unit.id.desc()).limit(params.limit + 1)

        rows = db.execute(stmt).scalars().all()
        has_more = len(rows) > params.limit
        page = rows[: params.limit]

        # One extra query for the whole page's thumbnails — never N+1. DISTINCT ON
        # (unit_id) ordered by sort_order picks each unit's first photo in a single
        # round-trip; the grid card needs exactly one image, not the full gallery
        # (codingconventions.md §6 — narrow projections, no loop-per-row queries).
        thumbnails: dict[int, str] = {}
        unit_ids = [u.id for u in page]
        if unit_ids:
            thumb_stmt = (
                select(UnitImage.unit_id, UnitImage.url)
                .distinct(UnitImage.unit_id)
                .where(UnitImage.unit_id.in_(unit_ids), UnitImage.deleted_at.is_(None))
                .order_by(UnitImage.unit_id, UnitImage.sort_order)
            )
            thumbnails = dict(db.execute(thumb_stmt).all())

        items = []
        for u in page:
            summary = UnitSummaryResponse.model_validate(u)
            summary.thumbnail_url = thumbnails.get(u.id)
            items.append(summary)

        return StockListResponse(
            items=items,
            next_cursor=page[-1].id if has_more and page else None,
        )

    @staticmethod
    def _active():
        """The storefront's definition of "in stock": live row, status in_stock."""
        return (Unit.deleted_at.is_(None), Unit.status == "in_stock")

    @staticmethod
    def count(db: Session) -> StockCountResponse:
        total = db.execute(select(func.count(Unit.id)).where(*StockService._active())).scalar_one()
        return StockCountResponse(count=int(total))

    @staticmethod
    def facets(db: Session) -> StockFacetsResponse:
        """Three GROUP BY queries over indexed columns (idx_units_status_category,
        idx_units_make_model), each bounded — never a scan of unit rows."""
        active = StockService._active()

        by_category = dict(
            db.execute(
                select(Unit.category, func.count(Unit.id)).where(*active).group_by(Unit.category)
            ).all()
        )
        makes = db.execute(
            select(Unit.make, func.count(Unit.id))
            .where(*active)
            .group_by(Unit.make)
            .order_by(func.count(Unit.id).desc(), Unit.make.asc())
            .limit(FACET_MAKES_LIMIT)
        ).all()
        body_types = db.execute(
            select(Unit.body_type, func.count(Unit.id))
            .where(*active)
            .group_by(Unit.body_type)
            .order_by(func.count(Unit.id).desc(), Unit.body_type.asc())
            .limit(FACET_BODY_TYPES_LIMIT)
        ).all()

        vehicles = int(by_category.get("vehicle", 0))
        equipment = int(by_category.get("equipment", 0))
        return StockFacetsResponse(
            total=vehicles + equipment,
            vehicles=vehicles,
            equipment=equipment,
            makes=[FacetCount(value=m, count=int(c)) for m, c in makes],
            body_types=[FacetCount(value=b, count=int(c)) for b, c in body_types],
        )

    @staticmethod
    def get_by_slug(slug: str, db: Session) -> UnitResponse:
        stmt = (
            select(Unit)
            .where(Unit.slug == slug, Unit.deleted_at.is_(None))
            .options(
                selectinload(Unit.images),
                selectinload(Unit.unit_features).selectinload(UnitFeature.feature),
            )
        )
        unit = db.execute(stmt).unique().scalar_one_or_none()
        if unit is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

        response = UnitResponse.model_validate(unit)
        # Pydantic doesn't validate on plain attribute assignment (validate_assignment
        # is off by default) — model_validate() each raw ORM row explicitly, not just
        # filter and assign it, or the response would carry SQLAlchemy objects in a
        # field typed as List[UnitImageResponse] and fail (or silently misserialize) later.
        response.images = [
            UnitImageResponse.model_validate(img) for img in unit.images if img.deleted_at is None
        ]
        response.features = [
            FeatureResponse.model_validate(uf.feature) for uf in unit.unit_features
            if uf.deleted_at is None and uf.feature.deleted_at is None
        ]
        return response
