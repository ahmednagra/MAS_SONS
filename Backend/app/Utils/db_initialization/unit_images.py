# app/Utils/db_initialization/unit_images.py

"""
Seed unit_images from DEFAULT_UNIT_IMAGES — one real exterior photo per seeded unit
(the source listing's own Main Image URL). Runs after units.py: resolves each entry's
`unit_slug` to the real unit_id, skips silently if that unit was never seeded (e.g. the
seed set was trimmed), and is idempotent on (unit_id, url).
"""

from sqlalchemy.orm import Session

from app.Utils.Logger import logger
from app.Models import Unit, UnitImage
from app.Utils.dictionaries import DEFAULT_UNIT_IMAGES


def initialize_default_unit_images(db: Session):
    """Initialize unit photo galleries with the seed image set."""
    try:
        logger.info(f"Initializing {len(DEFAULT_UNIT_IMAGES)} default unit images...")

        for image_data in DEFAULT_UNIT_IMAGES:
            unit = db.query(Unit).filter(Unit.slug == image_data["unit_slug"]).first()
            if not unit:
                continue

            existing = (
                db.query(UnitImage)
                .filter(UnitImage.unit_id == unit.id, UnitImage.url == image_data["url"])
                .first()
            )
            if not existing:
                image = UnitImage(
                    unit_id=unit.id,
                    url=image_data["url"],
                    photo_type=image_data["photo_type"],
                    sort_order=image_data["sort_order"],
                )
                db.add(image)

        db.commit()
        logger.info("Default unit images initialized successfully")

    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing unit images: {str(e)}")
        raise
