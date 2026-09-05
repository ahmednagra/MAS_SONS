# app/Utils/db_initialization/features.py

"""
Seed the structured equipment checklist (databaseschema.md §2) from DEFAULT_FEATURES —
real option names extracted from the CarGurus seed listings. Idempotent: matches on
`name`, never duplicates or overwrites an existing row.
"""

from sqlalchemy.orm import Session

from app.Utils.Logger import logger
from app.Models import Feature
from app.Utils.dictionaries import DEFAULT_FEATURES


def initialize_default_features(db: Session):
    """Initialize the features master checklist with the seed feature vocabulary."""
    try:
        logger.info(f"Initializing {len(DEFAULT_FEATURES)} default features...")

        for feature_data in DEFAULT_FEATURES:
            feature = db.query(Feature).filter(Feature.name == feature_data["name"]).first()
            if not feature:
                feature = Feature(**feature_data)
                db.add(feature)

        db.commit()
        logger.info("Default features initialized successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing features: {str(e)}")
        raise
