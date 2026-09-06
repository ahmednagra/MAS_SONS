# app/Utils/db_initialization/features.py
# Seed the equipment vocabulary from DEFAULT_FEATURES; idempotent on name.
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Feature
from app.Utils.Logger import logger
from app.Utils.dictionaries import DEFAULT_FEATURES


def initialize_default_features(db: Session) -> None:
    """Insert every seed feature whose name is not already present."""
    try:
        existing = set(db.execute(select(Feature.name)).scalars())
        missing = [f for f in DEFAULT_FEATURES if f["name"] not in existing]
        db.add_all(Feature(**f) for f in missing)
        db.commit()
        logger.info(f"Features seeded: {len(missing)} inserted, {len(DEFAULT_FEATURES) - len(missing)} already present")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing features: {e}")
        raise
