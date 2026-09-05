# app/Utils/db_initialization/units.py

"""
Seed the stock catalog from DEFAULT_UNITS (real Autotrader/CarGurus/CommercialTruckTrader
listings, transformed — see app/Utils/dictionaries/units.py for exactly what's real vs.
derived). Idempotent: matches on `slug`, never duplicates or overwrites an existing row.
"""

from sqlalchemy.orm import Session

from app.Utils.Logger import logger
from app.Models import Unit
from app.Utils.dictionaries import DEFAULT_UNITS


def initialize_default_units(db: Session):
    """Initialize the stock catalog with the seed unit inventory."""
    try:
        logger.info(f"Initializing {len(DEFAULT_UNITS)} default units...")

        for unit_data in DEFAULT_UNITS:
            unit = db.query(Unit).filter(Unit.slug == unit_data["slug"]).first()
            if not unit:
                unit = Unit(**unit_data)
                db.add(unit)

        db.commit()
        logger.info("Default units initialized successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing units: {str(e)}")
        raise
