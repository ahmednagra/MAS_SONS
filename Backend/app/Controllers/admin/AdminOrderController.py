# app/Controllers/admin/AdminOrderController.py
from typing import Optional

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.order import (
    OrderCreateFromQuote, OrderCreateFromSourcing, OrderPaymentStatusUpdate,
    OrderResponse, OrderShippingStatusUpdate,
)
from app.Services.Notifications.NotificationService import NotificationService
from app.Services.OrderService import OrderService
from app.Utils import Audit
from app.Utils.GuestContact import GuestContact
from app.Utils.Logger import logger


class AdminOrderController:
    @staticmethod
    def create_from_quote(data: OrderCreateFromQuote, staff: User, db: Session) -> OrderResponse:
        try:
            response = OrderService.create_from_quote(data, db)
            Audit.record(
                db, entity_type="order", entity_id=response.id, action="create",
                actor_type="staff", actor_user_id=staff.id,
            )
            db.commit()
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create_from_quote: {e}")
            raise

    @staticmethod
    def create_from_sourcing(data: OrderCreateFromSourcing, staff: User, db: Session) -> OrderResponse:
        try:
            response = OrderService.create_from_sourcing(data, db)
            Audit.record(
                db, entity_type="order", entity_id=response.id, action="create",
                actor_type="staff", actor_user_id=staff.id,
            )
            db.commit()
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create_from_sourcing: {e}")
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
    def get_by_id(id: int, staff: User, db: Session) -> OrderResponse:
        try:
            return OrderService.get_by_id(id, staff, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_id: {e}")
            raise

    @staticmethod
    def update_shipping_status(
        id: int, data: OrderShippingStatusUpdate, staff: User, db: Session, background_tasks: BackgroundTasks,
    ) -> OrderResponse:
        try:
            response = OrderService.update_shipping_status(id, data, db)

            Audit.record(
                db, entity_type="order", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id, changed_fields={"shipping_status": response.shipping_status},
            )
            db.commit()

            NotificationService.notify_buyer(
                "stock.shipment_update",
                recipient=GuestContact(
                    name=response.contact_name, email=response.contact_email, whatsapp=None,
                    user_id=response.user_id,
                ),
                title="Shipment update", body=f"Order #{response.id} is now {response.shipping_status}.",
                email_context={
                    "contact_name": response.contact_name, "order_id": response.id,
                    "shipping_status": response.shipping_status, "destination_country": response.destination_country,
                },
                action_url=f"/orders/{response.id}",
                source_entity_type="order", source_entity_id=response.id,
                db=db, background_tasks=background_tasks,
            )
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_shipping_status: {e}")
            raise

    @staticmethod
    def update_payment_status(id: int, data: OrderPaymentStatusUpdate, staff: User, db: Session) -> OrderResponse:
        try:
            response = OrderService.update_payment_status(id, data, db)
            Audit.record(
                db, entity_type="order", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id, changed_fields={"payment_status": response.payment_status},
            )
            db.commit()
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_payment_status: {e}")
            raise
