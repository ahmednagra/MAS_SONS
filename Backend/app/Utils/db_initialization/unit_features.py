# app/Utils/db_initialization/unit_features.py

"""
Seed unit_features from DEFAULT_UNIT_FEATURES — which of the seeded features each
seeded unit actually has, taken directly from that unit's real source options list.
Runs after both units.py and features.py: resolves `unit_slug`/`feature_name` to their
real ids, skips silently if either side was never seeded, and is idempotent on the
same composite key as the table's own primary key (unit_id, feature_id).
"""

from sqlalchemy.orm import Session

from app.Utils.Logger import logger
from app.Models import Unit, Feature, UnitFeature
from app.Utils.dictionaries import DEFAULT_UNIT_FEATURES


def initialize_default_unit_features(db: Session):
    """Initialize confirmed unit↔feature links with the seed data."""
    try:
        logger.info(f"Initializing {len(DEFAULT_UNIT_FEATURES)} default unit_features links...")

        unit_ids_by_slug = {u.slug: u.id for u in db.query(Unit.id, Unit.slug).all()}
        feature_ids_by_name = {f.name: f.id for f in db.query(Feature.id, Feature.name).all()}

        for link in DEFAULT_UNIT_FEATURES:
            unit_id = unit_ids_by_slug.get(link["unit_slug"])
            feature_id = feature_ids_by_name.get(link["feature_name"])
            if unit_id is None or feature_id is None:
                continue

            existing = (
                db.query(UnitFeature)
                .filter(UnitFeature.unit_id == unit_id, UnitFeature.feature_id == feature_id)
                .first()
            )
            if not existing:
                db.add(UnitFeature(unit_id=unit_id, feature_id=feature_id))
            elif existing.deleted_at is not None:
                # Re-confirming a previously-retracted feature restores the row rather
                # than inserting a duplicate — matches databaseschema.md §2's own note.
                existing.deleted_at = None
                existing.deleted_by = None

        db.commit()
        logger.info("Default unit_features initialized successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing unit_features: {str(e)}")
        raise
