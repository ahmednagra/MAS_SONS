# app/Services/Notifications/Channels/base_channel.py
# BaseChannel — every channel's deliver() returns an OperationResult and never raises; one channel failing never blocks another…
from abc import ABC, abstractmethod

from app.Services.Notifications.payload import NotificationPayload
from app.Utils.Results import OperationResult


class BaseChannel(ABC):
    name: str

    @abstractmethod
    def deliver(self, payload: NotificationPayload, *args, **kwargs) -> OperationResult: ...
