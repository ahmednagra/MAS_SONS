# app/Controllers/SourcingRequestController.py
from typing import Optional

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.sourcing_request import (
    SourcingRequestCreate, SourcingRequestResponse, SourcingRequestStatusUpdate,
)
from app.Services.Notifications.NotificationService import NotificationService
from app.Services.Notifications.Email.EmailService import EmailService
from app.Services.SourcingRequestService import SourcingRequestService
from app.Utils import Audit
from app.Utils.GuestContact import GuestContact
from app.Utils.Logger import logger


class SourcingRequestController:
    @staticmethod
    def create(
        data: SourcingRequestCreate, user: Optional[User], db: Session, background_tasks: BackgroundTasks,
    ) -> SourcingRequestResponse:
        try:
            response = SourcingRequestService.create(data, user, db)

            Audit.record(
                db, entity_type="sourcing_request", entity_id=response.id, action="create",
                actor_type="buyer", actor_user_id=user.id if user else None,
            )
            db.commit()

            email_context = {
                "contact_name": response.contact_name, "sourcing_request_id": response.id,
                "model_description": response.model_description, "make": response.make or "",
                "budget_max_usd": float(response.budget_max_usd) if response.budget_max_usd else None,
            }
            EmailService.send_template_in_background(
                background_tasks, to_email=response.contact_email, template_name="sourcing_requests/confirmation",
                subject="We're sourcing your request", context=email_context, user_id=response.user_id,
            )
            NotificationService.notify_staff(
                "sourcing_request.received", title="New sourcing request",
                body=f"{response.contact_name} is looking for {response.model_description} (#{response.id})",
                email_context=email_context, action_url=f"/admin/sourcing-requests/{response.id}",
                source_entity_type="sourcing_request", source_entity_id=response.id,
                db=db, background_tasks=background_tasks,
            )
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create: {e}")
            raise

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> SourcingRequestResponse:
        try:
            return SourcingRequestService.get_by_id(id, current_user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_id: {e}")
            raise

    @staticmethod
    def list_mine(current_user: User, cursor: Optional[int], limit: int, db: Session) -> list[SourcingRequestResponse]:
        try:
            return SourcingRequestService.list_mine(current_user, cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_mine: {e}")
            raise

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[SourcingRequestResponse]:
        try:
            return SourcingRequestService.list_all(cursor, limit, status_filter, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_all: {e}")
            raise

    @staticmethod
    def update_status(
        id: int, data: SourcingRequestStatusUpdate, staff: User, db: Session, background_tasks: BackgroundTasks,
    ) -> SourcingRequestResponse:
        try:
            response = SourcingRequestService.update_status(id, data, db)

            Audit.record(
                db, entity_type="sourcing_request", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id, changed_fields={"status": response.status},
            )
            db.commit()

            if response.status == "found":
                NotificationService.notify_buyer(
                    "sourcing_request.sourced",
                    recipient=GuestContact(
                        name=response.contact_name, email=response.contact_email,
                        whatsapp=response.contact_whatsapp, user_id=response.user_id,
                    ),
                    title="We found your vehicle", body=f"Sourcing request #{response.id} has been sourced.",
                    email_context={"contact_name": response.contact_name, "sourcing_request_id": response.id},
                    action_url=f"/sourcing-requests/{response.id}",
                    source_entity_type="sourcing_request", source_entity_id=response.id,
                    db=db, background_tasks=background_tasks,
                )
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in update_status: {e}")
            raise
