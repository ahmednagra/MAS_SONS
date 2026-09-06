# routes/api/v0/orders.py
from typing import Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.OrderController import OrderController
from app.Models import User
from app.Schemas.order import OrderFulfillmentDetailInput, OrderFulfillmentDetailResponse, OrderResponse
from app.Utils.Helpers import get_current_user
from config.database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[OrderResponse])
def list_my_orders(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return OrderController.list_mine(current_user, cursor, limit, db)


@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return OrderController.get_by_id(id, current_user, db)


@router.put("/{id}/fulfillment-details", response_model=OrderFulfillmentDetailResponse)
def submit_fulfillment_details(
    id: int, data: OrderFulfillmentDetailInput,
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    return OrderController.submit_fulfillment_details(id, data, current_user, db)
