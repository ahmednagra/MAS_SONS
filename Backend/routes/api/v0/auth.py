# routes/api/v0/auth.py
# Auth endpoints — multi-provider login, refresh rotation (databaseschema.md §1).
from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.Controllers.AuthController import AuthController
from app.Models import User
from app.Schemas.auth import (
    GoogleAuthRequest, LoginRequest, LogoutRequest, MagicLinkRequest,
    MagicLinkVerifyRequest, RefreshRequest, RegisterRequest, TokenResponse, UserResponse,
)
from app.Utils.Helpers import get_current_user
from config.database import get_db

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/register", response_model=TokenResponse)
def register(data: RegisterRequest, request: Request, db: Session = Depends(get_db)):
    return AuthController.register(data, request, db)


@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, request: Request, db: Session = Depends(get_db)):
    return AuthController.login(data, request, db)


@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, request: Request, db: Session = Depends(get_db)):
    return AuthController.refresh(data, request, db)


@router.post("/logout")
def logout(data: LogoutRequest, db: Session = Depends(get_db)):
    return AuthController.logout(data, db)


@router.post("/magic-link/request")
def request_magic_link(data: MagicLinkRequest, db: Session = Depends(get_db)):
    return AuthController.request_magic_link(data, db)


@router.post("/magic-link/verify", response_model=TokenResponse)
def verify_magic_link(data: MagicLinkVerifyRequest, request: Request, db: Session = Depends(get_db)):
    return AuthController.verify_magic_link(data, request, db)


@router.post("/google", response_model=TokenResponse)
def google_auth(data: GoogleAuthRequest, request: Request, db: Session = Depends(get_db)):
    return AuthController.google_auth(data, request, db)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return AuthController.get_me(current_user)
