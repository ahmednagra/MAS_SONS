# app/Utils/partitioning.py
# create_next_partition() / drop_expired_partitions() (sharedinfrastructure.md §4/§6) — one implementation, parameterized by table name, for all four…
from datetime import date
from typing import Optional

from sqlalchemy import text
from sqlalchemy.engine import Engine

from app.Utils.Logger import logger

PARTITIONED_TABLES = ("notifications", "email_logs", "audit_logs", "websocket_connection_log")


def _month_start(d: date) -> date:
    return d.replace(day=1)


def _add_months(d: date, months: int) -> date:
    month_index = d.month - 1 + months
    year = d.year + month_index // 12
    month = month_index % 12 + 1
    return date(year, month, 1)


def _partition_name(table: str, month_start: date) -> str:
    return f"{table}_{month_start.year:04d}_{month_start.month:02d}"


def create_partition_for_month(engine: Engine, table: str, month_start: date) -> str:
    name = _partition_name(table, month_start)
    next_month = _add_months(month_start, 1)
    # DDL cannot take bind parameters in Postgres (partition bounds must be literals).
    with engine.begin() as conn:
        conn.execute(
            text(
                f'CREATE TABLE IF NOT EXISTS "{name}" PARTITION OF "{table}" '
                f"FOR VALUES FROM ('{month_start.isoformat()}') TO ('{next_month.isoformat()}')"
            )
        )
    return name


def create_next_partition(engine: Engine, table: str) -> str:
    """The partition Cloud Scheduler's monthly rotation call creates ahead of need."""
    return create_partition_for_month(engine, table, _add_months(_month_start(date.today()), 1))


def ensure_current_and_next_partition(engine: Engine, table: str) -> None:
    """Called at startup so inserts never fail waiting on a cron job to fire first."""
    today = _month_start(date.today())
    create_partition_for_month(engine, table, today)
    create_partition_for_month(engine, table, _add_months(today, 1))


def drop_expired_partitions(engine: Engine, table: str, retention_months: int) -> list[str]:
    cutoff = _add_months(_month_start(date.today()), -retention_months)
    dropped: list[str] = []
    prefix = f"{table}_"
    with engine.begin() as conn:
        rows = conn.execute(
            text(
                "SELECT inhrelid::regclass::text AS partition_name "
                "FROM pg_inherits WHERE inhparent = CAST(:table AS regclass)"
            ),
            {"table": table},
        ).fetchall()
        for (partition_name,) in rows:
            short_name = partition_name.split(".")[-1].strip('"')
            if not short_name.startswith(prefix):
                continue
            try:
                year, month = short_name[len(prefix):].split("_")
                partition_start = date(int(year), int(month), 1)
            except ValueError:
                continue
            if partition_start < cutoff:
                conn.execute(text(f'DROP TABLE IF EXISTS "{short_name}"'))
                dropped.append(short_name)
                logger.info(f"Dropped expired partition {short_name}")
    return dropped


def ensure_partitioned_tables(engine: Engine) -> None:
    """One-time bootstrap: converts a plain (unpartitioned) table into a partitioned one by dropping and letting create_all() recreate it — safe only…"""
    with engine.begin() as conn:
        for table in PARTITIONED_TABLES:
            exists = conn.execute(
                text("SELECT 1 FROM information_schema.tables WHERE table_name = :t"), {"t": table}
            ).first()
            if not exists:
                continue
            is_partitioned = conn.execute(
                text(
                    "SELECT 1 FROM pg_partitioned_table pt "
                    "JOIN pg_class c ON c.oid = pt.partrelid WHERE c.relname = :t"
                ),
                {"t": table},
            ).first()
            if is_partitioned:
                continue
            row_count = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar_one()
            if row_count > 0:
                raise RuntimeError(
                    f"Refusing to convert '{table}' to a partitioned table: it holds {row_count} "
                    "existing row(s). Partitioning a populated table requires a real data migration, "
                    "not an automatic drop."
                )
            conn.execute(text(f'DROP TABLE "{table}" CASCADE'))
            logger.info(f"Dropped empty unpartitioned table '{table}' — recreated partitioned below.")


def ensure_all_partitions(engine: Engine) -> None:
    for table in PARTITIONED_TABLES:
        ensure_current_and_next_partition(engine, table)


def get_retention_months(table: str) -> Optional[int]:
    return {
        "notifications": 12,
        "email_logs": 12,
        "audit_logs": 36,
        "websocket_connection_log": 3,
    }.get(table)
