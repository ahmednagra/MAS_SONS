# app/Services/OrderService.py
# Orders: staff conversion from quote/sourcing requests, buyer visibility, status updates.
from datetime import datetime, timezone
from typing import Optional

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.Models import Order, OrderFulfillmentDetail, QuoteRequest, SourcingRequest, User
from app.Schemas.order import (
    OrderCreateFromQuote, OrderCreateFromSourcing, OrderFulfillmentDetailInput,
    OrderFulfillmentDetailResponse, OrderPaymentStatusUpdate, OrderResponse, OrderShippingStatusUpdate,
)
from app.Utils.Query import get_live, keyset_page


def _reject_if_converted(db: Session, column, source_id: int, what: str) -> None:
    if db.execute(select(Order.id).where(column == source_id).limit(1)).first() is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"{what} already converted")


class OrderService:
    @staticmethod
    def create_from_quote(data: OrderCreateFromQuote, db: Session) -> OrderResponse:
        quote = get_live(db, QuoteRequest, data.quote_request_id, "Quote request not found")
        _reject_if_converted(db, Order.quote_request_id, quote.id, "Quote request")
        row = Order(
            quote_request_id=quote.id, unit_id=quote.unit_id, user_id=quote.user_id,
            contact_name=quote.contact_name, contact_email=quote.contact_email,
            final_price_usd=data.final_price_usd, incoterm=quote.incoterm,
            destination_country=quote.destination_country,
        )
        db.add(row)
        quote.status = "closed"
        db.commit()
        db.refresh(row)
        return OrderResponse.model_validate(row)

    @staticmethod
    def create_from_sourcing(data: OrderCreateFromSourcing, db: Session) -> OrderResponse:
        sourcing = get_live(db, SourcingRequest, data.sourcing_request_id, "Sourcing request not found")
        _reject_if_converted(db, Order.sourcing_request_id, sourcing.id, "Sourcing request")
        if not sourcing.destination_country:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Sourcing request has no destination country")
        row = Order(
            sourcing_request_id=sourcing.id, unit_id=data.unit_id, user_id=sourcing.user_id,
            contact_name=sourcing.contact_name, contact_email=sourcing.contact_email,
            final_price_usd=data.final_price_usd, incoterm=sourcing.quote_type or "FOB",
            destination_country=sourcing.destination_country,
        )
        db.add(row)
        sourcing.status = "closed"
        db.commit()
        db.refresh(row)
        return OrderResponse.model_validate(row)

    @staticmethod
    def _get_owned_or_staff(id: int, current_user: User, db: Session) -> Order:
        row = get_live(db, Order, id, "Order not found")
        if current_user.user_type != "staff" and row.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not your order")
        return row

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> OrderResponse:
        return OrderResponse.model_validate(OrderService._get_owned_or_staff(id, current_user, db))

    @staticmethod
    def list_mine(user: User, cursor: Optional[int], limit: int, db: Session) -> list[OrderResponse]:
        stmt = select(Order).where(Order.user_id == user.id, Order.deleted_at.is_(None))
        rows = db.execute(keyset_page(stmt, Order.id, cursor, limit)).scalars().all()
        return [OrderResponse.model_validate(r) for r in rows]

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, db: Session) -> list[OrderResponse]:
        stmt = select(Order).where(Order.deleted_at.is_(None))
        rows = db.execute(keyset_page(stmt, Order.id, cursor, limit)).scalars().all()
        return [OrderResponse.model_validate(r) for r in rows]

    @staticmethod
    def update_shipping_status(id: int, data: OrderShippingStatusUpdate, db: Session) -> OrderResponse:
        row = get_live(db, Order, id, "Order not found")
        row.shipping_status = data.shipping_status
        row.shipping_status_updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(row)
        return OrderResponse.model_validate(row)

    @staticmethod
    def update_payment_status(id: int, data: OrderPaymentStatusUpdate, db: Session) -> OrderResponse:
        row = get_live(db, Order, id, "Order not found")
        row.payment_status = data.payment_status
        if data.invoice_number:
            row.invoice_number = data.invoice_number
        db.commit()
        db.refresh(row)
        return OrderResponse.model_validate(row)

    @staticmethod
    def submit_fulfillment_details(
        order_id: int, data: OrderFulfillmentDetailInput, current_user: User, db: Session,
    ) -> OrderFulfillmentDetailResponse:
        order = OrderService._get_owned_or_staff(order_id, current_user, db)
        detail = db.execute(
            select(OrderFulfillmentDetail).where(OrderFulfillmentDetail.order_id == order.id)
        ).scalars().first()
        if detail is None:
            detail = OrderFulfillmentDetail(order_id=order.id, **data.model_dump())
            db.add(detail)
        else:
            for field, value in data.model_dump().items():
                setattr(detail, field, value)
        db.commit()
        db.refresh(detail)
        return OrderFulfillmentDetailResponse.model_validate(detail)
