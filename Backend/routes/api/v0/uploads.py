# routes/api/v0/uploads.py
# Direct-to-API upload endpoint — the API server writes the file to local disk and stores the resulting URL in the database (app/Core/Storage/).
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.Controllers.UploadController import UploadController
from app.Core.Storage.uploads import read_bounded
from app.Models import User
from app.Schemas.upload import UploadResponse
from app.Utils.Helpers import get_optional_user

router = APIRouter(prefix="/uploads", tags=["Uploads"])

_AUTH_REQUIRED_PURPOSES = {"identity_document"}


@router.post("", response_model=UploadResponse)
def upload_file(
    purpose: str = Form(...), file: UploadFile = File(...),
    current_user: Optional[User] = Depends(get_optional_user),
):
    if purpose in _AUTH_REQUIRED_PURPOSES and current_user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authentication required")
    return UploadController.upload(purpose, file, read_bounded(file))
