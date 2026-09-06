# app/Utils/db_initialization/unit_images.py
# Seed unit_images from DEFAULT_UNIT_IMAGES; resolves unit_slug to unit_id, idempotent on (unit_id, url).
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Unit, UnitImage
from app.Utils.Logger import logger
from app.Utils.dictionaries import DEFAULT_UNIT_IMAGES


def initialize_default_unit_images(db: Session) -> None:
    """Insert every seed photo whose (unit, url) pair is not already present; unknown slugs are skipped."""
    try:
        unit_ids = dict(db.execute(select(Unit.slug, Unit.id)).all())
        existing = set(db.execute(select(UnitImage.unit_id, UnitImage.url)).all())
        rows = []
        for image in DEFAULT_UNIT_IMAGES:
            unit_id = unit_ids.get(image["unit_slug"])
            if unit_id is None or (unit_id, image["url"]) in existing:
                continue
            rows.append(UnitImage(
                unit_id=unit_id, url=image["url"], photo_type=image["photo_type"], sort_order=image["sort_order"],
            ))
        db.add_all(rows)
        db.commit()
        logger.info(f"Unit images seeded: {len(rows)} inserted, {len(DEFAULT_UNIT_IMAGES) - len(rows)} skipped or present")
    except Exception as e:
        db.rollback()
        logger.error(f"Error initializing unit images: {e}")
        raise
