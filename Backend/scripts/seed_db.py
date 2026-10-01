# scripts/seed_db.py
# Seed step of scripts/deploy.sh. Idempotent:
#   1. dictionaries — units, features, unit images, unit features, destinations
#      (app.Utils.db_init.initialize_all_default_data, the same call main.lifespan makes)
#   2. demo staff admin — only when DEMO_ADMIN_EMAIL and DEMO_ADMIN_PASSWORD are set in the
#      environment. Created once as staff/admin with a password identity; an existing live user
#      with that email is left untouched (re-running never resets a password someone changed).
#
#   cd Backend && DEMO_ADMIN_EMAIL=... DEMO_ADMIN_PASSWORD=... ./.venv/bin/python -m scripts.seed_db
import os
import sys

from sqlalchemy import func

from config.database import SessionLocal
from app.Models.auth_identities import AuthIdentity
from app.Models.users import User
from app.Services.AuthService import AuthService
from app.Utils.Logger import logger
from app.Utils.db_init import initialize_all_default_data


def ensure_demo_admin(db) -> None:
    email = (os.environ.get("DEMO_ADMIN_EMAIL") or "").strip().lower()
    password = os.environ.get("DEMO_ADMIN_PASSWORD") or ""
    if not email or not password:
        logger.info("[seed] DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD not set — no demo admin created")
        return
    if len(password) < 12:
        raise SystemExit("[seed] DEMO_ADMIN_PASSWORD must be at least 12 characters")
    existing = db.query(User).filter(func.lower(User.email) == email, User.deleted_at.is_(None)).first()
    if existing is not None:
        logger.info(f"[seed] demo admin {email} already exists (user_id={existing.id}) — left unchanged")
        return
    user = User(email=email, full_name="Demo Admin", user_type="staff", staff_role="admin", status="active",
                email_verified_at=func.now())
    db.add(user)
    db.flush()
    db.add(AuthIdentity(user_id=user.id, provider="password", password_hash=AuthService.hash_password(password)))
    db.commit()
    logger.info(f"[seed] demo admin {email} created (user_id={user.id})")


def main() -> int:
    db = SessionLocal()
    try:
        initialize_all_default_data(db)
        ensure_demo_admin(db)
    finally:
        db.close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
