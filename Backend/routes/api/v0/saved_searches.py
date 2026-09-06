# routes/api/v0/saved_searches.py
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.Controllers.SavedSearchController import SavedSearchController
from app.Models import User
from app.Schemas.saved_search import SavedSearchCreate, SavedSearchResponse, SavedSearchUpdate
from app.Utils.Helpers import get_current_user
from config.database import get_db

router = APIRouter(prefix="/saved-searches", tags=["Saved Searches"])


@router.get("", response_model=list[SavedSearchResponse])
def list_saved_searches(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return SavedSearchController.list_mine(current_user, db)


@router.post("", response_model=SavedSearchResponse)
def create_saved_search(
    data: SavedSearchCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return SavedSearchController.create(current_user, data, db)


@router.patch("/{id}", response_model=SavedSearchResponse)
def update_saved_search(
    id: int, data: SavedSearchUpdate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return SavedSearchController.update(current_user, id, data, db)


@router.delete("/{id}")
def delete_saved_search(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    SavedSearchController.delete(current_user, id, db)
    return {"message": "Saved search deleted"}
