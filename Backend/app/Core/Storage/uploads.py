# app/Core/Storage/uploads.py
# Bounded multipart read shared by every upload route.
from fastapi import HTTPException, UploadFile, status

from app.Core.Storage.storage_constants import MAX_UPLOAD_SIZE_BYTES


def read_bounded(file: UploadFile) -> bytes:
    """Read at most MAX+1 bytes so an under-declared upload never buffers more than the cap."""
    if file.size is not None and file.size > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")
    content = file.file.read(MAX_UPLOAD_SIZE_BYTES + 1)
    if len(content) > MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File too large")
    return content
