# scripts/normalize_catalog.py

"""
Canonicalise units.make / units.body_type in the live database using
app/Utils/catalog_normalize.py. Idempotent — re-running changes nothing.

    cd Backend && python -m scripts.normalize_catalog [--dry-run]
"""
import argparse
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from sqlalchemy import select  # noqa: E402

from app.Models import Unit  # noqa: E402
from app.Utils.catalog_normalize import normalize_body_type, normalize_make  # noqa: E402
from config.database import SessionLocal  # noqa: E402


def run(dry_run: bool) -> int:
    db = SessionLocal()
    try:
        rows = db.execute(select(Unit).where(Unit.deleted_at.is_(None))).scalars().all()
        changes = 0
        for u in rows:
            make, body = normalize_make(u.make), normalize_body_type(u.body_type)
            if make != u.make or body != u.body_type:
                print(f"#{u.id} {u.slug}: make {u.make!r} -> {make!r}, body_type {u.body_type!r} -> {body!r}")
                u.make, u.body_type = make, body
                changes += 1
        if dry_run:
            db.rollback()
            print(f"dry run: {changes} row(s) would change")
        else:
            db.commit()
            print(f"updated {changes} row(s)")
        return changes
    finally:
        db.close()


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    run(ap.parse_args().dry_run)
