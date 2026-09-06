# routes/api/v0/admin/orders.py
from typing import Optional

from fastapi import APIRouter, BackgroundTasks, Depends, Query
from sqlalchemy.orm import Session

from app.Controllers.admin.AdminOrderController import AdminOrderController
from app.Models import User
from app.Schemas.order import (
    OrderCreateFromQuote, OrderCreateFromSourcing, OrderPaymentStatusUpdate,
    OrderResponse, OrderShippingStatusUpdate,
)
from app.Utils.Helpers import require_staff
from config.database import get_db

router = APIRouter(prefix="/admin/orders", tags=["Admin - Orders"])


@router.post("/from-quote", response_model=OrderResponse)
def create_order_from_quote(
    data: OrderCreateFromQuote, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminOrderController.create_from_quote(data, staff, db)


@router.post("/from-sourcing", response_model=OrderResponse)
def create_order_from_sourcing(
    data: OrderCreateFromSourcing, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminOrderController.create_from_sourcing(data, staff, db)


@router.get("", response_model=list[OrderResponse])
def list_all_orders(
    cursor: Optional[int] = None, limit: int = Query(24, ge=1, le=100),
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminOrderController.list_all(cursor, limit, db)


@router.get("/{id}", response_model=OrderResponse)
def get_order(id: int, staff: User = Depends(require_staff), db: Session = Depends(get_db)):
    return AdminOrderController.get_by_id(id, staff, db)


@router.patch("/{id}/shipping-status", response_model=OrderResponse)
def update_shipping_status(
    id: int, data: OrderShippingStatusUpdate, background_tasks: BackgroundTasks,
    staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminOrderController.update_shipping_status(id, data, staff, db, background_tasks)


@router.patch("/{id}/payment-status", response_model=OrderResponse)
def update_payment_status(
    id: int, data: OrderPaymentStatusUpdate, staff: User = Depends(require_staff), db: Session = Depends(get_db),
):
    return AdminOrderController.update_payment_status(id, data, staff, db)
