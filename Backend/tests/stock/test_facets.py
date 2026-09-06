# tests/stock/test_facets.py
import pytest
from sqlalchemy import select

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
    veh = StockService.facets(db, "vehicle")
    eq = StockService.facets(db, "equipment")

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
