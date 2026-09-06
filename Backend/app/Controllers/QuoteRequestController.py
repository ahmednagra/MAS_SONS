# app/Controllers/QuoteRequestController.py
from typing import Optional

from fastapi import BackgroundTasks, HTTPException
from sqlalchemy.orm import Session

from app.Models import User
from app.Schemas.quote_request import QuoteRequestCreate, QuoteRequestQuote, QuoteRequestResponse
from app.Services.Notifications.Email.EmailService import EmailService
from app.Services.Notifications.NotificationService import NotificationService
from app.Services.QuoteRequestService import QuoteRequestService
from app.Utils import Audit
from app.Utils.GuestContact import GuestContact
from app.Utils.Logger import logger


class QuoteRequestController:
    @staticmethod
    def create(
        data: QuoteRequestCreate, user: Optional[User], db: Session, background_tasks: BackgroundTasks,
    ) -> QuoteRequestResponse:
        try:
            response = QuoteRequestService.create(data, user, db)

            Audit.record(
                db, entity_type="quote_request", entity_id=response.id, action="create",
                actor_type="buyer", actor_user_id=user.id if user else None,
            )
            db.commit()

            email_context = {
                "contact_name": response.contact_name, "contact_email": response.contact_email,
                "quote_request_id": response.id, "destination_country": response.destination_country,
                "incoterm": response.incoterm, "unit_make": response.unit_make or "",
                "unit_model": response.unit_model or "", "unit_year": response.unit_year or "",
            }
            EmailService.send_template_in_background(
                background_tasks, to_email=response.contact_email, template_name="quote_requests/confirmation",
                subject="We've received your quote request", context=email_context, user_id=response.user_id,
            )
            NotificationService.notify_staff(
                "quote_request.received", title="New quote request",
                body=f"{response.contact_name} requested a quote (#{response.id})",
                email_context=email_context, action_url=f"/admin/quote-requests/{response.id}",
                source_entity_type="quote_request", source_entity_id=response.id,
                db=db, background_tasks=background_tasks,
            )
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in create: {e}")
            raise

    @staticmethod
    def get_by_id(id: int, current_user: User, db: Session) -> QuoteRequestResponse:
        try:
            return QuoteRequestService.get_by_id(id, current_user, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in get_by_id: {e}")
            raise

    @staticmethod
    def list_mine(current_user: User, cursor: Optional[int], limit: int, db: Session) -> list[QuoteRequestResponse]:
        try:
            return QuoteRequestService.list_mine(current_user, cursor, limit, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_mine: {e}")
            raise

    @staticmethod
    def list_all(cursor: Optional[int], limit: int, status_filter: Optional[str], db: Session) -> list[QuoteRequestResponse]:
        try:
            return QuoteRequestService.list_all(cursor, limit, status_filter, db)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in list_all: {e}")
            raise

    @staticmethod
    def quote(
        id: int, data: QuoteRequestQuote, staff: User, db: Session, background_tasks: BackgroundTasks,
    ) -> QuoteRequestResponse:
        try:
            response = QuoteRequestService.quote(id, data, db)

            Audit.record(
                db, entity_type="quote_request", entity_id=response.id, action="update",
                actor_type="staff", actor_user_id=staff.id,
                changed_fields={"status": response.status, "quoted_price_usd": float(response.quoted_price_usd)},
            )
            db.commit()

            NotificationService.notify_buyer(
                "quote_request.quoted",
                recipient=GuestContact(
                    name=response.contact_name, email=response.contact_email, whatsapp=response.contact_whatsapp,
                    user_id=response.user_id,
                ),
                title="Your quote is ready", body=f"Your quote #{response.id} is ready.",
                email_context={
                    "contact_name": response.contact_name, "quote_request_id": response.id,
                    "quoted_price_usd": float(response.quoted_price_usd), "incoterm": response.incoterm,
                    "unit_make": response.unit_make or "", "unit_model": response.unit_model or "",
                    "unit_year": response.unit_year or "",
                },
                action_url=f"/quote-requests/{response.id}",
                source_entity_type="quote_request", source_entity_id=response.id,
                db=db, background_tasks=background_tasks,
            )
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in quote: {e}")
            raise
