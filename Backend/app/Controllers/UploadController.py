# app/Controllers/UploadController.py
from fastapi import HTTPException, UploadFile

from app.Schemas.upload import UploadResponse
from app.Services.UploadService import UploadService
from app.Utils.Logger import logger


class UploadController:
    @staticmethod
    def upload(purpose: str, file: UploadFile, content: bytes) -> UploadResponse:
        try:
            return UploadService.upload(purpose, file, content)
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in upload: {e}")
            raise
