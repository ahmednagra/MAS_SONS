# app/Utils/db_initialization/__init__.py

"""
Database initialization module for default/seed data setup — mirrors echooo-backend's
own app/Utils/db_initialization/ package exactly (one file per table, each exposing an
idempotent initialize_default_<table>(db) function; the actual data lives in
app/Utils/dictionaries/).
"""

from app.Utils.db_initialization.units import initialize_default_units
from app.Utils.db_initialization.features import initialize_default_features
from app.Utils.db_initialization.unit_images import initialize_default_unit_images
from app.Utils.db_initialization.unit_features import initialize_default_unit_features

__all__ = [
    "initialize_default_units",
    "initialize_default_features",
    "initialize_default_unit_images",
    "initialize_default_unit_features",
]
