# routes/api/v0/admin/stock.py
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, UploadFile, status
from sqlalchemy.orm import Session

from app.Controllers.admin.AdminStockController import AdminStockController
from app.Core.Storage.uploads import read_bounded
from app.Models import User
from app.Schemas.stock import UnitImageResponse, UnitPriceUpdate, UnitResponse
from app.Utils.Helpers import require_staff
from config.database import get_db

router = APIRouter(prefix="/admin/stock", tags=["Admin - Stock"])


@router.patch("/{id}/price", response_model=UnitResponse)
def update_unit_price(
    id: int, data: UnitPriceUpdate, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminStockController.update_price(id, data, staff, db)


@router.post("/{id}/images", response_model=UnitImageResponse, status_code=status.HTTP_201_CREATED)
def add_unit_photo(
    id: int,
    file: UploadFile = File(...),
    photo_type: str = Form("exterior"),
    sort_order: Optional[int] = Form(None),
    alt_text: Optional[str] = Form(None),
    staff: User = Depends(require_staff),
    db: Session = Depends(get_db),
):
    """Attach one gallery photo (jpeg/png/webp, <=10 MB). Idempotent per file content."""
    return AdminStockController.add_photo(
        id, content=read_bounded(file), content_type=file.content_type, photo_type=photo_type,
        sort_order=sort_order, alt_text=alt_text, staff=staff, db=db,
    )


@router.delete("/{id}/images/{image_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_unit_photo(id: int, image_id: int, staff: User = Depends(require_staff), db: Session = Depends(get_db)):
    AdminStockController.remove_photo(id, image_id, staff, db)


@router.put("/{id}/auction-sheet", response_model=UnitResponse)
def set_unit_auction_sheet(
    id: int, file: UploadFile = File(...), staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    """Replace the unit's auction inspection sheet (pdf/jpeg/png, <=10 MB)."""
    return AdminStockController.set_auction_sheet(
        id, content=read_bounded(file), content_type=file.content_type, staff=staff, db=db,
    )
