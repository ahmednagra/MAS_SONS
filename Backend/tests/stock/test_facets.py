# tests/stock/test_facets.py
import pytest
from sqlalchemy import select

from app.Schemas.stock import StockSearchParams
from app.Services.StockService import StockService


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


def test_facets_scoped_by_category_are_consistent(db):
    all_ = StockService.facets(db)
    veh = StockService.facets(db, StockSearchParams(category="vehicle"))
    eq = StockService.facets(db, StockSearchParams(category="equipment"))

    assert all_.total == all_.vehicles + all_.equipment
    assert veh.total == all_.vehicles and eq.total == all_.equipment
    assert sum(b.count for b in veh.body_types) <= veh.total
    assert all(s.value in ("LHD", "RHD") for s in veh.steering_positions)
    assert all(g.value in ("5", "4.5", "4", "3.5", "3", "R", "RA") for g in veh.grades)
    if veh.total:
        assert veh.year_min <= veh.year_max
        assert veh.price_min <= veh.price_max
    else:
        assert veh.year_min is None and veh.price_min is None


def test_facets_cascade_and_exclude_own_dimension(db):
    base = StockService.facets(db, StockSearchParams(category="vehicle"))
    if not base.makes:
        pytest.skip("no vehicles")
    make = base.makes[0].value
    narrowed = StockService.facets(db, StockSearchParams(category="vehicle", make=make))

    assert narrowed.total == base.makes[0].count
    # Body types cascade from the make filter ...
    assert sum(b.count for b in narrowed.body_types) == narrowed.total
    # ... but the make list still offers the alternatives (its own filter is excluded).
    assert [m.value for m in narrowed.makes] == [m.value for m in base.makes]
    # Category split ignores the category filter so the picker keeps both options.
    assert narrowed.vehicles + narrowed.equipment >= narrowed.total
