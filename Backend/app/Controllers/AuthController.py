# app/Controllers/AuthController.py
# Multi-provider auth + refresh rotation endpoints (databaseschema.md §1).
from fastapi import HTTPException, Request
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.auth import (
    GoogleAuthRequest, LoginRequest, LogoutRequest, MagicLinkRequest,
    MagicLinkVerifyRequest, RefreshRequest, RegisterRequest, TokenResponse, UserResponse,
)
from app.Services.AuthService import AuthService
from app.Utils.Logger import logger


class AuthController:
    @staticmethod
    def register(data: RegisterRequest, request: Request, db: Session) -> TokenResponse:
        try:
            user = AuthService.register_with_password(
                email=data.email, password=data.password, full_name=data.full_name,
                phone=data.phone, db=db,
            )
            return AuthService.issue_tokens(
                user, db, user_agent=request.headers.get("user-agent"), ip_address=request.client.host
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in register: {e}")
            raise

    @staticmethod
    def login(data: LoginRequest, request: Request, db: Session) -> TokenResponse:
        try:
            user = AuthService.authenticate_password(data.email, data.password, db)
            return AuthService.issue_tokens(
                user, db, user_agent=request.headers.get("user-agent"), ip_address=request.client.host
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in login: {e}")
            raise

    @staticmethod
    def refresh(data: RefreshRequest, request: Request, db: Session) -> TokenResponse:
        try:
            return AuthService.rotate_refresh_token(
                data.refresh_token, db,
                user_agent=request.headers.get("user-agent"), ip_address=request.client.host,
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in refresh: {e}")
            raise

    @staticmethod
    def logout(data: LogoutRequest, db: Session) -> dict:
        try:
            AuthService.revoke_refresh_token(data.refresh_token, db)
            return {"message": "Successfully logged out"}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in logout: {e}")
            raise

    @staticmethod
    def request_magic_link(data: MagicLinkRequest, db: Session) -> dict:
        try:
            AuthService.request_magic_link(data.email, db)  # raw token is returned for the email step
            # TODO(emailsubsystem.md): send `raw_token` via EmailService's notifications/saved_search_digest-style template once implemented.
            logger.info(f"Magic link requested for {data.email} (email dispatch not yet wired)")
            return {"message": "If that email has an account, a sign-in link has been sent."}
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in request_magic_link: {e}")
            raise

    @staticmethod
    def verify_magic_link(data: MagicLinkVerifyRequest, request: Request, db: Session) -> TokenResponse:
        try:
            user = AuthService.verify_magic_link(data.token, db)
            return AuthService.issue_tokens(
                user, db, user_agent=request.headers.get("user-agent"), ip_address=request.client.host
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in verify_magic_link: {e}")
            raise

    @staticmethod
    def google_auth(data: GoogleAuthRequest, request: Request, db: Session) -> TokenResponse:
        try:
            user = AuthService.authenticate_google(data.id_token, db)
            return AuthService.issue_tokens(
                user, db, user_agent=request.headers.get("user-agent"), ip_address=request.client.host
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in google_auth: {e}")
            raise

    @staticmethod
    def get_me(current_user: User) -> UserResponse:
        return UserResponse.model_validate(current_user)
