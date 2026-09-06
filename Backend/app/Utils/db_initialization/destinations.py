# app/Utils/db_initialization/destinations.py
# Seed the destinations reference table from DEFAULT_DESTINATIONS; idempotent on country_code.
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Destination
from app.Utils.Logger import logger
from app.Utils.dictionaries import DEFAULT_DESTINATIONS


def initialize_default_destinations(db: Session) -> None:
    """Insert every seed destination whose country_code is not already present."""
    try:
        existing = set(db.execute(select(Destination.country_code)).scalars())
        missing = [d for d in DEFAULT_DESTINATIONS if d["country_code"] not in existing]
        db.add_all(Destination(**d) for d in missing)
        db.commit()
        logger.info(f"Destinations seeded: {len(missing)} inserted, {len(DEFAULT_DESTINATIONS) - len(missing)} already present")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing destinations: {e}")
        raise
