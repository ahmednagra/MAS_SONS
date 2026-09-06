# app/Services/StockService.py
# Stock catalog business logic (databaseschema.md §2).
from collections import Counter
from typing import Optional, Sequence

from fastapi import HTTPException, status
from sqlalchemy import and_, case, func, or_, select, tuple_
from sqlalchemy.orm import Session, selectinload

from app.Models import Destination, Feature, Unit, UnitFeature, UnitImage
from app.Schemas.destination import DestinationResponse
from app.Schemas.stock import (
    FacetCount, FeatureResponse, GradeCount, MarketPosition, PricePoint, StockCountResponse,
    StockFacetsResponse, StockListResponse, StockSearchParams, UnitImageResponse,
    UnitInsightsResponse, UnitPriceUpdate, UnitResponse, UnitSummaryResponse,
)

# Browse-by-make / body-type tiles are a fixed-size UI element, not a paginated list — cap the GROUP BY output rather than shipping every distinct…
FACET_MAKES_LIMIT = 12
FACET_BODY_TYPES_LIMIT = 10
FACET_FUEL_TYPES_LIMIT = 8

# GET /stock/by-ids — a buyer's favorites list is small; this bounds one batch lookup so it can never become an unbounded IN (...) query.
MAX_BY_IDS = 50

# Detail-page insights: peer stats come from a bounded, narrow projection — the newest INSIGHT_SAMPLE_LIMIT peers, six scalar columns each — so the…
INSIGHT_SAMPLE_LIMIT = 200
INSIGHT_MIN_PEERS = 3          # fewer than this and we widen the scope
COMPARABLES_LIMIT = 8
PRICE_POINTS_LIMIT = 40
GRADE_ORDER = ("5", "4.5", "4", "3.5", "3", "R", "RA")
GRADE_RANK = {g: i for i, g in enumerate(reversed(GRADE_ORDER))}   # 'RA' -> 0 ... '5' -> 6
_NO_MILEAGE = 10**9   # sorts unknown mileage last under mileage_asc


def _median(values: Sequence[float]) -> Optional[float]:
    if not values:
        return None
    ordered = sorted(values)
    mid = len(ordered) // 2
    return ordered[mid] if len(ordered) % 2 else (ordered[mid - 1] + ordered[mid]) / 2


def _percentile_rank(values: Sequence[float], x: float) -> Optional[int]:
    """Share of `values` at or below `x`, as an integer 0-100. None when no peers."""
    if not values:
        return None
    return round(100 * sum(1 for v in values if v <= x) / len(values))


class StockService:
    @staticmethod
    def search(params: StockSearchParams, db: Session) -> StockListResponse:
        stmt = select(Unit).where(Unit.deleted_at.is_(None))

        # Every filter here maps to one of units' own indexed columns (idx_units_status_category, idx_units_make_model, idx_units_grade, idx_units_price) — a…
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
            # auction_grade is an ordered ranking stored as text ('5' best ...
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
            # Free-text search: units.search_vector (a GIN-indexed generated tsvector column, databaseschema.md §2) is the real full-text path once the database…
            pattern = f"%{params.keyword}%"
            stmt = stmt.where(or_(Unit.make.ilike(pattern), Unit.model.ilike(pattern), Unit.description.ilike(pattern)))

        # First page only: a bounded count so the client can say "1-24 of N".
        total = None
        if params.cursor is None:
            total = int(db.execute(select(func.count()).select_from(stmt.order_by(None).subquery())).scalar_one())

        # Keyset pagination on (sort column, id): the cursor carries both so pages never
        # skip or repeat rows even when many units share a price or year.
        sort_col, descending, cast = StockService._sort_column(params.sort)
        if params.cursor is not None:
            if sort_col is None:
                stmt = stmt.where(Unit.id < params.cursor)
            elif params.cursor_value is not None:
                value = cast(params.cursor_value)
                step = sort_col < value if descending else sort_col > value
                stmt = stmt.where(or_(step, and_(sort_col == value, Unit.id < params.cursor)))
        order = [Unit.id.desc()] if sort_col is None else [sort_col.desc() if descending else sort_col.asc(), Unit.id.desc()]
        stmt = stmt.order_by(*order).limit(params.limit + 1)

        rows = db.execute(stmt).scalars().all()
        has_more = len(rows) > params.limit
        page = rows[: params.limit]
        last = page[-1] if has_more and page else None

        return StockListResponse(
            items=StockService._summaries_with_thumbnails(page, db),
            next_cursor=last.id if last else None,
            next_cursor_value=StockService._sort_value(params.sort, last) if last and sort_col is not None else None,
            total=total,
        )

    @staticmethod
    def _sort_column(sort: str):
        """(column expression, descending, cursor-value parser) for a sort key; None column means id order."""
        if sort == "price_asc":
            return Unit.price_usd, False, float
        if sort == "price_desc":
            return Unit.price_usd, True, float
        if sort == "year_desc":
            return Unit.year, True, int
        if sort == "mileage_asc":
            return func.coalesce(Unit.mileage_km, _NO_MILEAGE), False, int
        if sort == "grade_desc":
            return case(GRADE_RANK, value=Unit.auction_grade, else_=0), True, int
        return None, True, int

    @staticmethod
    def _sort_value(sort: str, unit: Unit) -> str:
        if sort in ("price_asc", "price_desc"):
            return str(float(unit.price_usd))
        if sort == "year_desc":
            return str(unit.year)
        if sort == "mileage_asc":
            return str(unit.mileage_km if unit.mileage_km is not None else _NO_MILEAGE)
        return str(GRADE_RANK.get(unit.auction_grade, 0))

    @staticmethod
    def _summaries_with_thumbnails(units: Sequence[Unit], db: Session) -> list[UnitSummaryResponse]:
        """One extra query for a whole page's thumbnails — never N+1."""
        thumbnails: dict[int, str] = {}
        unit_ids = [u.id for u in units]
        if unit_ids:
            thumb_stmt = (
                select(UnitImage.unit_id, UnitImage.url)
                .distinct(UnitImage.unit_id)
                .where(UnitImage.unit_id.in_(unit_ids), UnitImage.deleted_at.is_(None))
                .order_by(UnitImage.unit_id, UnitImage.sort_order)
            )
            thumbnails = dict(db.execute(thumb_stmt).all())

        items = []
        for u in units:
            summary = UnitSummaryResponse.model_validate(u)
            summary.thumbnail_url = thumbnails.get(u.id)
            items.append(summary)
        return items

    @staticmethod
    def _active():
        """The storefront's definition of "in stock": live row, status in_stock."""
        return (Unit.deleted_at.is_(None), Unit.status == "in_stock")

    @staticmethod
    def count(db: Session) -> StockCountResponse:
        total = db.execute(select(func.count(Unit.id)).where(*StockService._active())).scalar_one()
        return StockCountResponse(count=int(total))

    @staticmethod
    def facets(db: Session, category: Optional[str] = None) -> StockFacetsResponse:
        """Bounded GROUP BY / MIN / MAX queries over units columns (idx_units_status_category, idx_units_make_model, idx_units_grade, idx_units_price) — never a…"""
        active = StockService._active()
        scoped = active + ((Unit.category == category,) if category in ("vehicle", "equipment") else ())

        by_category = dict(
            db.execute(
                select(Unit.category, func.count(Unit.id)).where(*active).group_by(Unit.category)
            ).all()
        )

        # One GROUPING SETS scan yields every dimension's counts; each is then capped in Python.
        dims = (Unit.make, Unit.body_type, Unit.steering_position, Unit.fuel_type, Unit.auction_grade)
        rows = db.execute(
            select(*dims, func.count(Unit.id).label("n"))
            .where(*scoped)
            .group_by(func.grouping_sets(*[tuple_(d) for d in dims]))
        ).all()
        by_dim: dict[str, list[tuple[str, int]]] = {d.key: [] for d in dims}
        for row in rows:
            for i, d in enumerate(dims):
                if row[i] is not None:
                    by_dim[d.key].append((str(row[i]), int(row.n)))
                    break

        def grouped(column, limit: Optional[int]):
            ranked = sorted(by_dim[column.key], key=lambda vc: (-vc[1], vc[0]))
            return [FacetCount(value=v, count=c) for v, c in (ranked[:limit] if limit else ranked)]

        year_min, year_max, price_min, price_max = db.execute(
            select(func.min(Unit.year), func.max(Unit.year), func.min(Unit.price_usd), func.max(Unit.price_usd))
            .where(*scoped)
        ).one()

        vehicles = int(by_category.get("vehicle", 0))
        equipment = int(by_category.get("equipment", 0))
        total = vehicles + equipment
        if category == "vehicle":
            total = vehicles
        elif category == "equipment":
            total = equipment
        return StockFacetsResponse(
            total=total,
            vehicles=vehicles,
            equipment=equipment,
            makes=grouped(Unit.make, FACET_MAKES_LIMIT),
            body_types=grouped(Unit.body_type, FACET_BODY_TYPES_LIMIT),
            steering_positions=grouped(Unit.steering_position, None),   # at most 2 values (CHECK)
            fuel_types=grouped(Unit.fuel_type, FACET_FUEL_TYPES_LIMIT),
            grades=grouped(Unit.auction_grade, None),                  # at most 7 values (CHECK)
            year_min=int(year_min) if year_min is not None else None,
            year_max=int(year_max) if year_max is not None else None,
            price_min=float(price_min) if price_min is not None else None,
            price_max=float(price_max) if price_max is not None else None,
        )

    @staticmethod
    def get_by_ids(ids: list[int], db: Session) -> StockListResponse:
        if not ids:
            return StockListResponse(items=[], next_cursor=None)
        if len(ids) > MAX_BY_IDS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"At most {MAX_BY_IDS} ids per request")

        rows = db.execute(
            select(Unit).where(Unit.id.in_(ids), Unit.deleted_at.is_(None))
        ).scalars().all()
        by_id = {u.id: u for u in rows}
        ordered = [by_id[i] for i in ids if i in by_id]  # preserve caller-supplied order
        return StockListResponse(items=StockService._summaries_with_thumbnails(ordered, db), next_cursor=None)

    @staticmethod
    def get_by_slug(slug: str, db: Session) -> UnitResponse:
        stmt = (
            select(Unit)
            .where(Unit.slug == slug, Unit.deleted_at.is_(None))
            .options(
                selectinload(Unit.images),
                selectinload(Unit.unit_features).joinedload(UnitFeature.feature),
            )
        )
        unit = db.execute(stmt).unique().scalar_one_or_none()
        if unit is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

        response = UnitResponse.model_validate(unit)
        # Pydantic doesn't validate on plain attribute assignment (validate_assignment is off by default) — model_validate() each raw ORM row explicitly, not…
        response.images = [
            UnitImageResponse.model_validate(img) for img in unit.images if img.deleted_at is None
        ]
        response.features = [
            FeatureResponse.model_validate(uf.feature) for uf in unit.unit_features
            if uf.deleted_at is None and uf.feature.deleted_at is None
        ]
        return response

    @staticmethod
    def insights(slug: str, db: Session) -> UnitInsightsResponse:
        """Market position + comparables + shipping + equipment vocabulary for one unit's detail page."""
        unit = db.execute(
            select(Unit).where(Unit.slug == slug, Unit.deleted_at.is_(None))
        ).scalar_one_or_none()
        if unit is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")

        is_vehicle = unit.category == "vehicle"
        usage_col = Unit.mileage_km if is_vehicle else Unit.operating_hours
        unit_usage = unit.mileage_km if is_vehicle else unit.operating_hours

        base = (
            select(Unit.id, Unit.slug, Unit.year, Unit.price_usd, usage_col.label("usage"), Unit.auction_grade)
            .where(*StockService._active(), Unit.id != unit.id, Unit.category == unit.category)
            .order_by(Unit.id.desc())
            .limit(INSIGHT_SAMPLE_LIMIT)
        )
        # make/body_type are canonical on every write path (app/Utils/catalog_normalize.py), so exact equality is correct here and can use idx_units_make_model.
        scopes = (
            ("model", f"{unit.make} {unit.model}", (Unit.make == unit.make, Unit.model == unit.model)),
            ("body_type", f"{unit.body_type} · all makes", (Unit.body_type == unit.body_type,)),
            ("category", "All vehicles" if is_vehicle else "All heavy equipment", ()),
        )
        rows: list = []
        scope, label = scopes[-1][0], scopes[-1][1]
        for scope, label, conditions in scopes:
            rows = db.execute(base.where(*conditions)).all()
            if len(rows) >= INSIGHT_MIN_PEERS:
                break

        prices = [float(r.price_usd) for r in rows]
        usages = [int(r.usage) for r in rows if r.usage is not None]
        grade_counts = Counter(r.auction_grade for r in rows)

        market = MarketPosition(
            scope=scope,
            label=label,
            peer_count=len(rows),
            price_min=min(prices) if prices else None,
            price_median=_median(prices),
            price_max=max(prices) if prices else None,
            price_avg=round(sum(prices) / len(prices), 2) if prices else None,
            usage_avg=round(sum(usages) / len(usages)) if usages else None,
            usage_unit="km" if is_vehicle else "hrs",
            price_percentile=_percentile_rank(prices, float(unit.price_usd)),
            usage_percentile=_percentile_rank(usages, unit_usage) if unit_usage is not None else None,
            grade_distribution=[GradeCount(grade=g, count=grade_counts.get(g, 0)) for g in GRADE_ORDER],
        )

        price_points = [
            PricePoint(id=unit.id, slug=unit.slug, year=unit.year, price_usd=float(unit.price_usd),
                       usage=unit_usage, auction_grade=unit.auction_grade, is_current=True)
        ] + [
            PricePoint(id=r.id, slug=r.slug, year=r.year, price_usd=float(r.price_usd),
                       usage=r.usage, auction_grade=r.auction_grade)
            for r in rows[:PRICE_POINTS_LIMIT]
        ]

        comparable_ids = [r.id for r in rows[:COMPARABLES_LIMIT]]
        comparables: list[UnitSummaryResponse] = []
        if comparable_ids:
            peers = db.execute(
                select(Unit).where(Unit.id.in_(comparable_ids)).order_by(Unit.id.desc())
            ).scalars().all()
            comparables = StockService._summaries_with_thumbnails(peers, db)

        destinations = [
            DestinationResponse.model_validate(d) for d in db.execute(
                select(Destination).where(Destination.deleted_at.is_(None)).order_by(Destination.country_name)
            ).scalars().all()
        ]
        feature_catalog = [
            FeatureResponse.model_validate(f) for f in db.execute(
                select(Feature)
                .where(Feature.deleted_at.is_(None), Feature.applies_to.in_((unit.category, "both")))
                .order_by(Feature.category, Feature.name)
            ).scalars().all()
        ]

        return UnitInsightsResponse(
            market=market, comparables=comparables, price_points=price_points,
            destinations=destinations, feature_catalog=feature_catalog,
        )

    @staticmethod
    def update_price(id: int, data: UnitPriceUpdate, db: Session) -> UnitResponse:
        unit = db.get(Unit, id)
        if unit is None or unit.deleted_at is not None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Unit not found")
        unit.price_usd = data.price_usd
        db.commit()
        db.refresh(unit)
        return StockService.get_by_slug(unit.slug, db)
