# app/Services/Notifications/Email/Providers/base_provider.py
# BaseEmailProvider ABC (emailsubsystem.md §2).
from abc import ABC, abstractmethod

from app.Utils.Results import OperationResult


class EmailMessage:
    def __init__(
        self, *, to_email: str, subject: str, html_body: str, text_body: str, template_name: str,
    ) -> None:
        self.to_email = to_email
        self.subject = subject
        self.html_body = html_body
        self.text_body = text_body
        self.template_name = template_name


class BaseEmailProvider(ABC):
    name: str

    @abstractmethod
    def send(self, message: EmailMessage) -> OperationResult: ...

    @abstractmethod
    def is_configured(self) -> bool: ...
