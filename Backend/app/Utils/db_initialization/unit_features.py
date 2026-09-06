# app/Utils/db_initialization/unit_features.py
# Seed unit_features from DEFAULT_UNIT_FEATURES; missing links are inserted, retracted ones restored.
from sqlalchemy import select, tuple_, update
from sqlalchemy.orm import Session

from app.Models import Feature, Unit, UnitFeature
from app.Utils.Logger import logger
from app.Utils.dictionaries import DEFAULT_UNIT_FEATURES


def initialize_default_unit_features(db: Session) -> None:
    """Resolve slug/name pairs to ids once, then insert missing links and restore soft-deleted ones in bulk."""
    try:
        unit_ids = dict(db.execute(select(Unit.slug, Unit.id)).all())
        feature_ids = dict(db.execute(select(Feature.name, Feature.id)).all())
        existing = {
            (unit_id, feature_id): deleted_at
            for unit_id, feature_id, deleted_at in db.execute(
                select(UnitFeature.unit_id, UnitFeature.feature_id, UnitFeature.deleted_at)
            ).all()
        }

        wanted = {
            (unit_ids[link["unit_slug"]], feature_ids[link["feature_name"]])
            for link in DEFAULT_UNIT_FEATURES
            if link["unit_slug"] in unit_ids and link["feature_name"] in feature_ids
        }
        missing = [pair for pair in wanted if pair not in existing]
        retracted = [pair for pair in wanted if existing.get(pair) is not None]

        db.add_all(UnitFeature(unit_id=u, feature_id=f) for u, f in missing)
        if retracted:
            db.execute(
                update(UnitFeature)
                .where(tuple_(UnitFeature.unit_id, UnitFeature.feature_id).in_(retracted))
                .values(deleted_at=None, deleted_by=None)
            )
        db.commit()
        logger.info(f"Unit features seeded: {len(missing)} inserted, {len(retracted)} restored")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing unit_features: {e}")
        raise
