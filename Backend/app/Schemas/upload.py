# app/Schemas/upload.py
from pydantic import BaseModel


class UploadResponse(BaseModel):
    url: str
    key: str
