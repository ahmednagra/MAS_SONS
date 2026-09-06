# routes/api/v0/favorites.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Controllers.FavoriteController import FavoriteController
from app.Models import User
from app.Schemas.favorite import FavoriteCreate, FavoriteResponse
from app.Utils.Helpers import get_current_user
from config.database import get_db

router = APIRouter(prefix="/favorites", tags=["Favorites"])


@router.get("", response_model=list[FavoriteResponse])
def list_favorites(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FavoriteController.list_mine(current_user, db)


@router.post("", response_model=FavoriteResponse)
def add_favorite(data: FavoriteCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return FavoriteController.add(current_user, data, db)


@router.delete("/{unit_id}")
def remove_favorite(unit_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    FavoriteController.remove(current_user, unit_id, db)
    return {"message": "Removed from favorites"}
