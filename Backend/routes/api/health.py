# routes/api/health.py

# Public health endpoints, mounted at the app root (no /api/v0 prefix) so infrastructure
# probes and uptime monitors reach them at stable URLs.
#
#   /health       - liveness: process is up and serving requests (fast, no dependencies)
#   /health/ready - readiness: process can serve real traffic (checks the database)
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.Utils.Logger import logger
from config.database import get_db
from config.settings import settings

router = APIRouter(prefix="/health", tags=["Health"])


@router.get("")
def health_check():
    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "timestamp": datetime.now(timezone.utc),
    }


@router.get("/ready")
def readiness_check(db: Session = Depends(get_db)):
    checks = {}
    try:
        db.execute(text("SELECT 1"))
        checks["database"] = "healthy"
    except Exception as e:
        logger.error(f"Readiness check failed - database unreachable: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "unhealthy",
                "service": settings.APP_NAME,
                "checks": {"database": "unhealthy"},
                "timestamp": datetime.now(timezone.utc).isoformat(),
            },
        )

    return {
        "status": "healthy",
        "service": settings.APP_NAME,
        "checks": checks,
        "timestamp": datetime.now(timezone.utc),
    }
