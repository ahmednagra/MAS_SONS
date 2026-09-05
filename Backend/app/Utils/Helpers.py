# app/Utils/Helpers.py

# Misc shared helpers — currently just the auth dependency chain every protected
# route uses. Mirrors echooo-backend's own cookie-aware bearer scheme (its
# app/Utils/Helpers.py), stripped of its RBAC/role-hierarchy specifics, which
# don't apply to this project's simple user_type/staff_role model
# (databaseschema.md §1).
from typing import Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.Models import User
from app.Services.AuthService import AuthService
from config.database import get_db
from config.settings import settings


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Accepts the token from an `Authorization: Bearer` header (API clients, the
    Swagger "Authorize" button) OR the httpOnly access-token cookie set by
    login/refresh (settings.COOKIE_AUTH_ENABLED) — header takes precedence.
    """

    _PLACEHOLDER_BEARERS = {"", "null", "undefined", "none"}

    async def __call__(self, request: Request) -> Optional[str]:
        authorization = request.headers.get("Authorization")
        if authorization and authorization.lower().startswith("bearer "):
            header_token = authorization.split(" ", 1)[1].strip()
            if header_token and header_token.lower() not in self._PLACEHOLDER_BEARERS:
                return header_token

        if settings.COOKIE_AUTH_ENABLED:
            cookie_token = request.cookies.get(settings.ACCESS_TOKEN_COOKIE_NAME)
            if cookie_token:
                return cookie_token

        return await super().__call__(request)


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl=f"{settings.API_V0_STR}/auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """The one dependency every protected route uses."""
    return AuthService.get_current_user(token, db)


def require_staff(current_user: User = Depends(get_current_user)) -> User:
    """For staff-only endpoints (admin controllers). userType/staff_role are UI
    context elsewhere in this stack's conventions, but server-side authorization
    is exactly what this dependency enforces — never trust a client-side check
    alone (directorystructure.md, security invariant carried over from the
    dashboard's own CLAUDE.md).
    """
    if current_user.user_type != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")
    return current_user


def client_ip(request: Request) -> Optional[str]:
    """Read from the trusted end of the proxy chain — the first entry of
    X-Forwarded-For is whatever the caller decided to write there, not evidence.
    """
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else None
