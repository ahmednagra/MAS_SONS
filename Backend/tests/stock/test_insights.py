# tests/stock/test_insights.py

# Unit tests for the pure stat helpers behind GET /stock/{slug}/insights, plus an
# integration check that runs only when the configured Postgres is reachable.
import pytest
from sqlalchemy import select

from app.Services.StockService import (
    GRADE_ORDER, INSIGHT_MIN_PEERS, PRICE_POINTS_LIMIT, StockService, _median, _percentile_rank,
)


def test_median_handles_empty_odd_even():
    assert _median([]) is None
    assert _median([5]) == 5
    assert _median([3, 1, 2]) == 2
    assert _median([4, 1, 3, 2]) == 2.5


def test_percentile_rank_is_share_at_or_below():
    assert _percentile_rank([], 10) is None
    assert _percentile_rank([10, 20, 30, 40], 25) == 50
    assert _percentile_rank([10, 20, 30, 40], 40) == 100
    assert _percentile_rank([10, 20, 30, 40], 5) == 0


@pytest.fixture
def db():
    try:
        from config.database import SessionLocal
        session = SessionLocal()
        session.execute(select(1))
    except Exception as exc:  # pragma: no cover - environment-dependent
        pytest.skip(f"database unreachable: {exc}")
    yield session
    session.close()


def test_insights_shape_against_live_catalog(db):
    from app.Models import Unit
    unit = db.execute(
        select(Unit).where(Unit.deleted_at.is_(None), Unit.status == "in_stock").order_by(Unit.id.desc())
    ).scalars().first()
    if unit is None:
        pytest.skip("no in-stock units")

    res = StockService.insights(unit.slug, db)

    assert res.market.scope in {"model", "body_type", "category"}
    assert [g.grade for g in res.market.grade_distribution] == list(GRADE_ORDER)
    assert res.price_points[0].is_current is True and res.price_points[0].id == unit.id
    assert all(not p.is_current for p in res.price_points[1:])
    assert len(res.price_points) <= PRICE_POINTS_LIMIT + 1
    assert all(c.id != unit.id for c in res.comparables)
    if res.market.peer_count >= INSIGHT_MIN_PEERS:
        assert res.market.price_min <= res.market.price_median <= res.market.price_max
        assert 0 <= res.market.price_percentile <= 100


def test_insights_404_for_unknown_slug(db):
    from fastapi import HTTPException
    with pytest.raises(HTTPException) as exc:
        StockService.insights("definitely-not-a-slug", db)
    assert exc.value.status_code == 404
