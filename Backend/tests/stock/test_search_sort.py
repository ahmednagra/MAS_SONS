# tests/stock/test_search_sort.py
import pytest
from sqlalchemy import select

from app.Schemas.stock import StockSearchParams
from app.Services.StockService import GRADE_RANK, StockService


@pytest.fixture
def db():
    try:
        from config.database import SessionLocal
        session = SessionLocal()
        session.execute(select(1))
    except Exception as exc:  # pragma: no cover
        pytest.skip(f"database unreachable: {exc}")
    yield session
    session.close()


def _walk(db, **kw):
    """Follow next_cursor to the end; return every id in order."""
    ids, cursor, value, total = [], None, None, None
    for _ in range(50):
        page = StockService.search(StockSearchParams(limit=24, cursor=cursor, cursor_value=value, **kw), db)
        if total is None:
            total = page.total
        ids += [u.id for u in page.items]
        if page.next_cursor is None:
            break
        cursor, value = page.next_cursor, page.next_cursor_value
    return ids, total


@pytest.mark.parametrize("sort,key", [
    ("price_asc", lambda u: (u.price_usd, -u.id)),
    ("price_desc", lambda u: (-u.price_usd, -u.id)),
    ("year_desc", lambda u: (-u.year, -u.id)),
    ("mileage_asc", lambda u: (u.mileage_km if u.mileage_km is not None else 10**9, -u.id)),
    ("grade_desc", lambda u: (-GRADE_RANK[u.auction_grade], -u.id)),
    ("newest", lambda u: -u.id),
])
def test_sorted_keyset_pages_cover_every_unit_once_in_order(db, sort, key):
    ids, total = _walk(db, sort=sort, category="vehicle")
    everything = StockService.search(StockSearchParams(limit=100, sort=sort, category="vehicle"), db)
    assert total is not None and total >= len(everything.items)
    assert len(ids) == total, "pages must cover the whole result set"
    assert len(set(ids)) == len(ids), "no unit may repeat across pages"
    units = {u.id: u for u in everything.items}
    ordered = [i for i in ids if i in units]
    assert ordered == sorted(ordered, key=lambda i: key(units[i]))


def test_total_only_on_first_page(db):
    first = StockService.search(StockSearchParams(limit=5), db)
    assert first.total is not None
    if first.next_cursor is not None:
        second = StockService.search(StockSearchParams(limit=5, cursor=first.next_cursor), db)
        assert second.total is None
