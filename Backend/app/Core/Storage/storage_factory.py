# app/Core/Storage/storage_factory.py
# Storage provider factory.
from app.Core.Storage.base_provider import BaseStorageProvider
from app.Core.Storage.Providers.local_provider import LocalStorageProvider


def get_storage_provider() -> BaseStorageProvider:
    return LocalStorageProvider()
