# app/Core/Storage/base_provider.py
# Abstract storage provider interface.
from abc import ABC, abstractmethod


class BaseStorageProvider(ABC):
    @abstractmethod
    def save(self, *, key: str, content: bytes, content_type: str) -> str: ...

    @abstractmethod
    def delete(self, key: str) -> None: ...
