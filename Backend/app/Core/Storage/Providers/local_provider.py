# app/Core/Storage/Providers/local_provider.py
# Local-disk provider — the only storage provider.
from pathlib import Path

from app.Core.Storage.base_provider import BaseStorageProvider
from config.settings import settings


class LocalStorageProvider(BaseStorageProvider):
    def __init__(self) -> None:
        self._root = Path(settings.LOCAL_STORAGE_DIR)
        self._root.mkdir(parents=True, exist_ok=True)

    def save(self, *, key: str, content: bytes, content_type: str) -> str:
        path = self._root / key
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)
        return f"{settings.PUBLIC_BASE_URL.rstrip('/')}/uploads/{key}"

    def delete(self, key: str) -> None:
        path = self._root / key
        if path.exists():
            path.unlink()
