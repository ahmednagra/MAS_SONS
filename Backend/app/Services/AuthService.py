# app/Services/AuthService.py
# Auth: password/Google/magic-link identities issuing JWT access + rotating refresh tokens.
import hashlib
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy import select, update
from sqlalchemy.orm import Session

from app.Models import AuthIdentity, MagicLinkToken, RefreshToken, User
from app.Schemas.auth import TokenResponse
from app.Utils.Logger import logger
from app.Utils.Net import safe_ip
from config.settings import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

_UNAUTHORIZED_HEADERS = {"WWW-Authenticate": "Bearer"}


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _unauthorized(detail: str) -> HTTPException:
    return HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=detail, headers=_UNAUTHORIZED_HEADERS)


def _live_user_by_email(email: str, db: Session) -> Optional[User]:
    return db.execute(select(User).where(User.email == email, User.deleted_at.is_(None))).scalars().first()


def _identity(db: Session, *conditions) -> Optional[AuthIdentity]:
    return db.execute(select(AuthIdentity).where(*conditions)).scalars().first()


class AuthService:
    """Every provider ends in the same JWT access token + rotating refresh token pair."""

    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def create_access_token(user: User) -> str:
        payload = {
            "sub": str(user.id),
            "user_type": user.user_type,
            "staff_role": user.staff_role,
            "exp": _now() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> dict:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except JWTError:
            raise _unauthorized("Invalid or expired token")

    @staticmethod
    def get_current_user(token: str, db: Session) -> User:
        """Resolve the bearer token to an active user (the dependency behind every protected route)."""
        user_id = AuthService.decode_access_token(token).get("sub")
        user = db.get(User, int(user_id)) if user_id else None
        if user is None or user.deleted_at is not None:
            raise _unauthorized("User not found")
        if user.status != "active":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")
        return user

    @staticmethod
    def _hash_token(raw: str) -> str:
        return hashlib.sha256(raw.encode()).hexdigest()

    @staticmethod
    def _token_pair(user: User, raw_refresh: str) -> TokenResponse:
        return TokenResponse(
            access_token=AuthService.create_access_token(user),
            refresh_token=raw_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    def _new_refresh_row(user: User, family_id, user_agent: Optional[str], ip_address: Optional[str]) -> tuple[RefreshToken, str]:
        raw = secrets.token_urlsafe(48)
        row = RefreshToken(
            user_id=user.id,
            token_hash=AuthService._hash_token(raw),
            family_id=family_id,
            expires_at=_now() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=user_agent,
            ip_address=safe_ip(ip_address),
        )
        return row, raw

    @staticmethod
    def issue_tokens(
        user: User, db: Session, *, user_agent: Optional[str] = None, ip_address: Optional[str] = None,
    ) -> TokenResponse:
        """Start a new refresh-token family (a fresh login)."""
        row, raw = AuthService._new_refresh_row(user, uuid.uuid4(), user_agent, ip_address)
        db.add(row)
        db.commit()
        return AuthService._token_pair(user, raw)

    @staticmethod
    def rotate_refresh_token(
        raw_refresh: str, db: Session, *, user_agent: Optional[str] = None, ip_address: Optional[str] = None,
    ) -> TokenResponse:
        """Rotate within the family; reuse of a replaced or revoked token revokes the whole family."""
        current = db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == AuthService._hash_token(raw_refresh))
        ).scalars().first()
        if current is None:
            raise _unauthorized("Invalid refresh token")
        if current.replaced_by_id is not None or current.revoked_at is not None:
            db.execute(update(RefreshToken).where(RefreshToken.family_id == current.family_id).values(revoked_at=_now()))
            db.commit()
            logger.warning(f"Refresh token reuse detected — revoked family {current.family_id}")
            raise _unauthorized("Refresh token has been revoked")
        if current.expires_at < _now():
            raise _unauthorized("Refresh token expired")

        user = db.get(User, current.user_id)
        if user is None or user.deleted_at is not None or user.status != "active":
            raise _unauthorized("Account is not active")

        new_row, raw = AuthService._new_refresh_row(user, current.family_id, user_agent, ip_address)
        db.add(new_row)
        db.flush()
        current.replaced_by_id = new_row.id
        db.commit()
        return AuthService._token_pair(user, raw)

    @staticmethod
    def revoke_refresh_token(raw_refresh: str, db: Session) -> None:
        row = db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == AuthService._hash_token(raw_refresh))
        ).scalars().first()
        if row is not None and row.revoked_at is None:
            row.revoked_at = _now()
            db.commit()

    @staticmethod
    def register_with_password(email: str, password: str, full_name: str, phone: Optional[str], db: Session) -> User:
        if _live_user_by_email(email, db) is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")
        user = User(email=email, full_name=full_name, phone=phone, user_type="buyer", status="active")
        db.add(user)
        db.flush()
        db.add(AuthIdentity(user_id=user.id, provider="password", password_hash=AuthService.hash_password(password)))
        db.commit()
        db.refresh(user)
        logger.info(f"Registered new buyer account: user_id={user.id}")
        return user

    @staticmethod
    def authenticate_password(email: str, password: str, db: Session) -> User:
        user = _live_user_by_email(email, db)
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        identity = _identity(
            db, AuthIdentity.user_id == user.id, AuthIdentity.provider == "password", AuthIdentity.deleted_at.is_(None),
        )
        if identity is None or not AuthService.verify_password(password, identity.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")
        if user.status != "active":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")
        identity.last_used_at = _now()
        db.commit()
        return user

    @staticmethod
    def request_magic_link(email: str, db: Session) -> str:
        """Create a login token and return its RAW value for the caller to email; never log it."""
        raw = secrets.token_urlsafe(32)
        db.add(MagicLinkToken(
            email=email,
            token_hash=AuthService._hash_token(raw),
            purpose="login",
            expires_at=_now() + timedelta(minutes=settings.MAGIC_LINK_TOKEN_EXPIRE_MINUTES),
        ))
        db.commit()
        return raw

    @staticmethod
    def verify_magic_link(raw_token: str, db: Session) -> User:
        token_row = db.execute(
            select(MagicLinkToken).where(
                MagicLinkToken.token_hash == AuthService._hash_token(raw_token), MagicLinkToken.purpose == "login",
            )
        ).scalars().first()
        if token_row is None or token_row.consumed_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or already-used link")
        if token_row.expires_at < _now():
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This link has expired")
        token_row.consumed_at = _now()

        user = _live_user_by_email(token_row.email, db)
        if user is None:
            user = User(email=token_row.email, full_name=token_row.email.split("@")[0], user_type="buyer", status="active")
            db.add(user)
            db.flush()

        identity = _identity(db, AuthIdentity.user_id == user.id, AuthIdentity.provider == "magic_link")
        if identity is None:
            db.add(AuthIdentity(user_id=user.id, provider="magic_link", last_used_at=_now()))
        else:
            identity.last_used_at = _now()
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def authenticate_google(id_token_str: str, db: Session) -> User:
        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Google sign-in is not configured")
        try:
            claims = google_id_token.verify_oauth2_token(
                id_token_str, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google token: {e}")

        google_subject = claims["sub"]
        email = claims.get("email")

        identity = _identity(db, AuthIdentity.provider == "google", AuthIdentity.provider_subject == google_subject)
        if identity is not None:
            user = db.get(User, identity.user_id)
            identity.last_used_at = _now()
            db.commit()
            return user

        user = _live_user_by_email(email, db)
        if user is None:
            user = User(email=email, full_name=claims.get("name", email.split("@")[0]), user_type="buyer", status="active")
            db.add(user)
            db.flush()
        db.add(AuthIdentity(user_id=user.id, provider="google", provider_subject=google_subject, last_used_at=_now()))
        db.commit()
        db.refresh(user)
        return user
