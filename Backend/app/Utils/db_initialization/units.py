# app/Utils/db_initialization/units.py
# Seed the stock catalog from DEFAULT_UNITS; idempotent on slug, never overwrites an existing row.
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Unit
from app.Utils.Logger import logger
from app.Utils.catalog_normalize import normalize_unit_fields
from app.Utils.dictionaries import DEFAULT_UNITS


def initialize_default_units(db: Session) -> None:
    """Insert every seed unit whose slug is not already present."""
    try:
        existing = set(db.execute(select(Unit.slug)).scalars())
        missing = [normalize_unit_fields(u) for u in DEFAULT_UNITS if u["slug"] not in existing]
        db.add_all(Unit(**u) for u in missing)
        db.commit()
        logger.info(f"Units seeded: {len(missing)} inserted, {len(DEFAULT_UNITS) - len(missing)} already present")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing units: {e}")
        raise
