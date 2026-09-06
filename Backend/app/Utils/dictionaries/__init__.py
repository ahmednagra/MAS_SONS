# app/Utils/dictionaries/__init__.py

"""
Default/seed data module — real reference data transformed from Backend/Docs/data for
seeders/ (units, unit_images, features, unit_features). Mirrors echooo-backend's own
app/Utils/dictionaries/ package exactly: pure static data here, seeding logic in
app/Utils/db_initialization/.
"""

from app.Utils.dictionaries.units import DEFAULT_UNITS
from app.Utils.dictionaries.unit_images import DEFAULT_UNIT_IMAGES
from app.Utils.dictionaries.features import DEFAULT_FEATURES
from app.Utils.dictionaries.unit_features import DEFAULT_UNIT_FEATURES
from app.Utils.dictionaries.destinations import DEFAULT_DESTINATIONS

__all__ = [
    "DEFAULT_UNITS",
    "DEFAULT_UNIT_IMAGES",
    "DEFAULT_FEATURES",
    "DEFAULT_UNIT_FEATURES",
    "DEFAULT_DESTINATIONS",
]
