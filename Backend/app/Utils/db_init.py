# app/Utils/db_init.py

"""
Master database initialization — mirrors echooo-backend's own app/Utils/db_init.py
exactly. Orchestrates all seed data in FK dependency order. Call
initialize_all_default_data() from main.py's lifespan function so a freshly-created
database is never empty on first run.
"""

from sqlalchemy.orm import Session

from app.Utils.Logger import logger
from app.Utils.db_initialization import (
    initialize_default_units,
    initialize_default_features,
    initialize_default_unit_images,
    initialize_default_unit_features,
)


def initialize_all_default_data(db: Session):
    """
    Master function to initialize all default/seed data, in dependency order:

    1. units             — no FK dependency among seed data.
    2. features          — no FK dependency among seed data.
    3. unit_images       — requires units to exist (resolves unit_slug -> unit_id).
    4. unit_features     — requires both units and features to exist.
    """
    try:
        logger.info("Starting initialization of all default data...")

        initialize_default_units(db)
        initialize_default_features(db)
        initialize_default_unit_images(db)
        initialize_default_unit_features(db)

        logger.info("All default data initialized successfully!")

    except Exception as e:
        logger.error(f"Error during default data initialization: {str(e)}")
        raise
