# app/Utils/Helpers.py
# Misc shared helpers — currently just the auth dependency chain every protected route uses.
from typing import Optional

from fastapi import Depends, HTTPException, Request, WebSocket, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.Models import User
from app.Services.AuthService import AuthService
from app.Utils.Net import safe_ip
from config.database import get_db
from config.settings import settings


class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    """Accepts the token from an `Authorization: Bearer` header (API clients, the Swagger "Authorize" button) OR the httpOnly access-token cookie set by…"""

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
oauth2_scheme_optional = OAuth2PasswordBearerWithCookie(
    tokenUrl=f"{settings.API_V0_STR}/auth/login", auto_error=False
)


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """The one dependency every protected route uses."""
    return AuthService.get_current_user(token, db)


def get_optional_user(
    token: Optional[str] = Depends(oauth2_scheme_optional), db: Session = Depends(get_db),
) -> Optional[User]:
    """For guest-allowed endpoints (QuoteRequest/SourcingRequest/Review create) — an absent or invalid token means a guest, never a 401."""
    if not token:
        return None
    try:
        return AuthService.get_current_user(token, db)
    except HTTPException:
        return None


def require_staff(current_user: User = Depends(get_current_user)) -> User:
    """For staff-only endpoints (admin controllers)."""
    if current_user.user_type != "staff":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Staff access required")
    return current_user


def client_ip(request: Request | WebSocket) -> Optional[str]:
    """Read from the trusted end of the proxy chain — the first entry of X-Forwarded-For is whatever the caller decided to write there, not evidence."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return safe_ip(request.client.host if request.client else None)
