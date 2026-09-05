# app/Services/AuthService.py

# Auth business logic — multi-provider identity (password/google/magic_link) via
# auth_identities, rotating refresh tokens with reuse detection (databaseschema.md §1).
# Raises HTTPException directly for domain errors — every method here is always called
# from inside an HTTP request (codingconventions.md §3).
import hashlib
import ipaddress
import secrets
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from fastapi import HTTPException, status
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token
from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.Models import AuthIdentity, MagicLinkToken, RefreshToken, User
from app.Schemas.auth import TokenResponse
from app.Utils.Logger import logger
from config.settings import settings

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class AuthService:
    """Multi-provider auth: password, Google OAuth, magic link — all issuing the same
    JWT access token + rotating refresh token pair, per databaseschema.md §1.
    """

    # -------------------------------------------------------------------------
    # Password hashing — argon2id (databaseschema.md's own Security convention,
    # not echooo-backend's bcrypt: a deliberate, already-documented choice).
    # -------------------------------------------------------------------------
    @staticmethod
    def hash_password(password: str) -> str:
        return pwd_context.hash(password)

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    # -------------------------------------------------------------------------
    # JWT access tokens — short-lived, never persisted, verified by signature only.
    # -------------------------------------------------------------------------
    @staticmethod
    def create_access_token(user: User) -> str:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        payload = {
            "sub": str(user.id),
            "user_type": user.user_type,
            "staff_role": user.staff_role,
            "exp": expire,
        }
        return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    def decode_access_token(token: str) -> dict:
        try:
            return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        except JWTError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token",
                headers={"WWW-Authenticate": "Bearer"},
            )

    @staticmethod
    def get_current_user(token: str, db: Session) -> User:
        """The FastAPI dependency every protected route depends on."""
        payload = AuthService.decode_access_token(token)
        user_id = payload.get("sub")
        user = db.get(User, int(user_id)) if user_id else None
        if user is None or user.deleted_at is not None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found",
                headers={"WWW-Authenticate": "Bearer"},
            )
        if user.status != "active":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")
        return user

    # -------------------------------------------------------------------------
    # Refresh tokens — rotate on every use; reusing an already-replaced or
    # revoked token revokes the whole family immediately (databaseschema.md §1).
    # -------------------------------------------------------------------------
    @staticmethod
    def _hash_token(raw: str) -> str:
        return hashlib.sha256(raw.encode()).hexdigest()

    @staticmethod
    def _safe_ip(value: Optional[str]) -> Optional[str]:
        """refresh_tokens.ip_address is INET — Postgres rejects anything that isn't
        a real address outright. request.client.host is untrusted input (it's
        "testclient" under Starlette's TestClient, and can be mangled by a
        misconfigured proxy in production); an audit-trail field is never worth
        failing a login over, so an unparseable value is dropped, not raised."""
        if not value:
            return None
        try:
            ipaddress.ip_address(value)
            return value
        except ValueError:
            return None

    @staticmethod
    def issue_tokens(
        user: User, db: Session, *,
        user_agent: Optional[str] = None, ip_address: Optional[str] = None,
    ) -> TokenResponse:
        """Issue a fresh access+refresh pair, starting a new rotation family
        (a new login) — see rotate_refresh_token for continuing an existing one."""
        raw_refresh = secrets.token_urlsafe(48)
        db.add(RefreshToken(
            user_id=user.id,
            token_hash=AuthService._hash_token(raw_refresh),
            family_id=uuid.uuid4(),
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=user_agent,
            ip_address=AuthService._safe_ip(ip_address),
        ))
        db.commit()

        return TokenResponse(
            access_token=AuthService.create_access_token(user),
            refresh_token=raw_refresh,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    def rotate_refresh_token(
        raw_refresh: str, db: Session, *,
        user_agent: Optional[str] = None, ip_address: Optional[str] = None,
    ) -> TokenResponse:
        token_hash = AuthService._hash_token(raw_refresh)
        current = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
        if current is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        if current.replaced_by_id is not None or current.revoked_at is not None:
            db.query(RefreshToken).filter(RefreshToken.family_id == current.family_id).update(
                {"revoked_at": datetime.now(timezone.utc)}
            )
            db.commit()
            logger.warning(f"Refresh token reuse detected — revoked family {current.family_id}")
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked")

        if current.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        user = db.get(User, current.user_id)
        if user is None or user.deleted_at is not None or user.status != "active":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is not active")

        new_raw = secrets.token_urlsafe(48)
        new_row = RefreshToken(
            user_id=user.id,
            token_hash=AuthService._hash_token(new_raw),
            family_id=current.family_id,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS),
            user_agent=user_agent,
            ip_address=AuthService._safe_ip(ip_address),
        )
        db.add(new_row)
        db.flush()
        current.replaced_by_id = new_row.id
        db.commit()

        return TokenResponse(
            access_token=AuthService.create_access_token(user),
            refresh_token=new_raw,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    @staticmethod
    def revoke_refresh_token(raw_refresh: str, db: Session) -> None:
        row = db.query(RefreshToken).filter(
            RefreshToken.token_hash == AuthService._hash_token(raw_refresh)
        ).first()
        if row is not None and row.revoked_at is None:
            row.revoked_at = datetime.now(timezone.utc)
            db.commit()

    # -------------------------------------------------------------------------
    # Password registration / login
    # -------------------------------------------------------------------------
    @staticmethod
    def register_with_password(
        email: str, password: str, full_name: str, phone: Optional[str], db: Session,
    ) -> User:
        existing = db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()
        if existing is not None:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered")

        user = User(email=email, full_name=full_name, phone=phone, user_type="buyer", status="active")
        db.add(user)
        db.flush()

        db.add(AuthIdentity(
            user_id=user.id, provider="password", password_hash=AuthService.hash_password(password)
        ))
        db.commit()
        db.refresh(user)
        logger.info(f"Registered new buyer account: user_id={user.id}")
        return user

    @staticmethod
    def authenticate_password(email: str, password: str, db: Session) -> User:
        user = db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()
        if user is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        identity = db.query(AuthIdentity).filter(
            AuthIdentity.user_id == user.id, AuthIdentity.provider == "password",
            AuthIdentity.deleted_at.is_(None),
        ).first()
        if identity is None or not AuthService.verify_password(password, identity.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect email or password")

        if user.status != "active":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account is not active")

        identity.last_used_at = datetime.now(timezone.utc)
        db.commit()
        return user

    # -------------------------------------------------------------------------
    # Magic link — passwordless login (databaseschema.md §1)
    # -------------------------------------------------------------------------
    @staticmethod
    def request_magic_link(email: str, db: Session) -> str:
        """Creates the token and returns the RAW value. The caller (Controller) emails
        it via EmailService (emailsubsystem.md) once that subsystem is implemented —
        the raw token must never be logged or returned in an HTTP response."""
        raw = secrets.token_urlsafe(32)
        db.add(MagicLinkToken(
            email=email,
            token_hash=AuthService._hash_token(raw),
            purpose="login",
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.MAGIC_LINK_TOKEN_EXPIRE_MINUTES),
        ))
        db.commit()
        return raw

    @staticmethod
    def verify_magic_link(raw_token: str, db: Session) -> User:
        token_row = db.query(MagicLinkToken).filter(
            MagicLinkToken.token_hash == AuthService._hash_token(raw_token),
            MagicLinkToken.purpose == "login",
        ).first()
        if token_row is None or token_row.consumed_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or already-used link")
        if token_row.expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="This link has expired")

        token_row.consumed_at = datetime.now(timezone.utc)

        user = db.query(User).filter(User.email == token_row.email, User.deleted_at.is_(None)).first()
        if user is None:
            # First-ever login via magic link creates the account — no password set.
            user = User(
                email=token_row.email, full_name=token_row.email.split("@")[0],
                user_type="buyer", status="active",
            )
            db.add(user)
            db.flush()

        identity = db.query(AuthIdentity).filter(
            AuthIdentity.user_id == user.id, AuthIdentity.provider == "magic_link",
        ).first()
        if identity is None:
            db.add(AuthIdentity(user_id=user.id, provider="magic_link", last_used_at=datetime.now(timezone.utc)))
        else:
            identity.last_used_at = datetime.now(timezone.utc)

        db.commit()
        db.refresh(user)
        return user

    # -------------------------------------------------------------------------
    # Google OAuth
    # -------------------------------------------------------------------------
    @staticmethod
    def authenticate_google(id_token_str: str, db: Session) -> User:
        if not settings.GOOGLE_OAUTH_CLIENT_ID:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google sign-in is not configured",
            )
        try:
            claims = google_id_token.verify_oauth2_token(
                id_token_str, google_requests.Request(), settings.GOOGLE_OAUTH_CLIENT_ID
            )
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid Google token: {e}")

        google_subject = claims["sub"]
        email = claims.get("email")

        identity = db.query(AuthIdentity).filter(
            AuthIdentity.provider == "google", AuthIdentity.provider_subject == google_subject,
        ).first()
        if identity is not None:
            user = db.get(User, identity.user_id)
            identity.last_used_at = datetime.now(timezone.utc)
            db.commit()
            return user

        # No existing Google identity — link to an account with the same email,
        # or create a new one. Either way this is the account's first Google sign-in.
        user = db.query(User).filter(User.email == email, User.deleted_at.is_(None)).first()
        if user is None:
            user = User(
                email=email, full_name=claims.get("name", email.split("@")[0]),
                user_type="buyer", status="active",
            )
            db.add(user)
            db.flush()

        db.add(AuthIdentity(
            user_id=user.id, provider="google", provider_subject=google_subject,
            last_used_at=datetime.now(timezone.utc),
        ))
        db.commit()
        db.refresh(user)
        return user
