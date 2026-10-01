# scripts/migrate_db.py
# Schema step of scripts/deploy.sh — the same work main.lifespan does on boot, run on its own so a
# deploy fails BEFORE the service restarts. Idempotent: extensions, partitioned-table bootstrap,
# create_all (missing tables only), then the current + next monthly partition of every partitioned
# table. Also run daily by mas-maintenance.timer so a long-running backend never reaches a month
# that has no partition (inserts into notifications/email_logs/audit_logs would fail).
#
#   cd Backend && ./.venv/bin/python -m scripts.migrate_db
import sys

from config.database import engine, ensure_postgres_extensions
from app.Models import Base
from app.Utils.Logger import logger
from app.Utils.partitioning import ensure_all_partitions, ensure_partitioned_tables


def main() -> int:
    ensure_postgres_extensions()
    ensure_partitioned_tables(engine)
    Base.metadata.create_all(bind=engine, checkfirst=True)
    ensure_all_partitions(engine)
    logger.info(f"[migrate] schema in sync — {len(Base.metadata.tables)} table(s), partitions current + next month")
    return 0


if __name__ == "__main__":
    sys.exit(main())
