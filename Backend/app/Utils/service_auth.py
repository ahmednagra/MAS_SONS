# app/Utils/service_auth.py
# verify_service_token() — Cloud Scheduler service-token guard (sharedinfrastructure.md §4).
from fastapi import HTTPException, Request, status

from config.settings import settings


def verify_service_token(request: Request) -> None:
    token = request.headers.get("X-Service-Token")
    if not settings.INTERNAL_JOBS_SERVICE_TOKEN or token != settings.INTERNAL_JOBS_SERVICE_TOKEN:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid service token")
