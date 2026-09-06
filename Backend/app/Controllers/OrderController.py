# app/Controllers/OrderController.py
from typing import Optional

from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.order import (
    OrderCreateFromQuote, OrderCreateFromSourcing, OrderFulfillmentDetailInput,
    OrderFulfillmentDetailResponse, OrderPaymentStatusUpdate, OrderResponse, OrderShippingStatusUpdate,
)
from app.Services.OrderService import OrderService
from app.Utils.Logger import logger


class OrderController:
    @staticmethod
    def create_from_quote(data: OrderCreateFromQuote, db: Session) -> OrderResponse:
        try:
            return OrderService.create_from_quote(data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create_from_quote: {e}")
            raise

    @staticmethod
    def create_from_sourcing(data: OrderCreateFromSourcing, db: Session) -> OrderResponse:
        try:
            return OrderService.create_from_sourcing(data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create_from_sourcing: {e}")
            raise

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> OrderResponse:
        try:
            return OrderService.get_by_id(id, current_user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_id: {e}")
            raise

    @staticmethod
    def list_mine(current_user: User, cursor: Optional[int], limit: int, db: Session) -> list[OrderResponse]:
        try:
            return OrderService.list_mine(current_user, cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_mine: {e}")
            raise

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, db: Session) -> list[OrderResponse]:
        try:
            return OrderService.list_all(cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_all: {e}")
            raise

    @staticmethod
    def update_shipping_status(id: int, data: OrderShippingStatusUpdate, db: Session) -> OrderResponse:
        try:
            return OrderService.update_shipping_status(id, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_shipping_status: {e}")
            raise

    @staticmethod
    def update_payment_status(id: int, data: OrderPaymentStatusUpdate, db: Session) -> OrderResponse:
        try:
            return OrderService.update_payment_status(id, data, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_payment_status: {e}")
            raise

    @staticmethod
    def submit_fulfillment_details(
        order_id: int, data: OrderFulfillmentDetailInput, current_user: User, db: Session,
    ) -> OrderFulfillmentDetailResponse:
        try:
            return OrderService.submit_fulfillment_details(order_id, data, current_user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in submit_fulfillment_details: {e}")
            raise
