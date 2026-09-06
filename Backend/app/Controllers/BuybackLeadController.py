# app/Controllers/BuybackLeadController.py
from typing import Optional

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.buyback_lead import BuybackLeadCreate, BuybackLeadResponse, BuybackLeadStatusUpdate
from app.Services.Notifications.NotificationService import NotificationService
from app.Services.BuybackLeadService import BuybackLeadService
from app.Utils import Audit
from app.Utils.Logger import logger


class BuybackLeadController:
    @staticmethod
    def create(data: BuybackLeadCreate, db: Session, background_tasks: BackgroundTasks) -> BuybackLeadResponse:
        try:
            response = BuybackLeadService.create(data, db)

            Audit.record(
                db, entity_type="buyback_lead", entity_id=response.id, action="create", actor_type="buyer",
            )
            db.commit()

            email_context = {
                "name": response.name, "buyback_lead_id": response.id,
                "description": response.vehicle_or_equipment_description, "phone": response.phone,
            }
            NotificationService.notify_staff(
                "buyback_lead.received", title="New buyback lead",
                body=f"{response.name} ({response.phone}) wants to sell: {response.vehicle_or_equipment_description}",
                email_context=email_context, action_url=f"/admin/buyback-leads/{response.id}",
                source_entity_type="buyback_lead", source_entity_id=response.id,
                db=db, background_tasks=background_tasks,
            )
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create: {e}")
            raise

    @staticmethod
    def get_by_id(id: int, db: Session) -> BuybackLeadResponse:
        try:
            return BuybackLeadService.get_by_id(id, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_id: {e}")
            raise

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[BuybackLeadResponse]:
        try:
            return BuybackLeadService.list_all(cursor, limit, status_filter, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_all: {e}")
            raise

    @staticmethod
    def update_status(id: int, data: BuybackLeadStatusUpdate, staff: User, db: Session) -> BuybackLeadResponse:
        try:
            response = BuybackLeadService.update_status(id, data, db)
            Audit.record(
                db, entity_type="buyback_lead", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id, changed_fields={"status": response.status},
            )
            db.commit()
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_status: {e}")
            raise
