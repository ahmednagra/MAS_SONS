# app/Models/base.py

# Declarative Base for all ORM models — mirrors echooo-backend's app/Models/base.py,
# using SQLAlchemy 2's own import path rather than the deprecated sqlalchemy.ext.declarative one.
from sqlalchemy.orm import declarative_base

Base = declarative_base()
