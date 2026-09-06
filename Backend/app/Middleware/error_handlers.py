# app/Middleware/error_handlers.py
# Exception handlers that keep response contracts and log *why* a request was rejected.
from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.Utils.Logger import logger, request_id_var


def _validation_summary(exc: RequestValidationError) -> list[str]:
    return [f"{'.'.join(str(p) for p in e.get('loc', ()))}: {e.get('msg')}" for e in exc.errors()][:10]


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(RequestValidationError)
    async def on_validation_error(request: Request, exc: RequestValidationError):
        problems = _validation_summary(exc)
        logger.warning(
            f"{request.method} {request.url.path} -> 422 validation failed: {'; '.join(problems)}",
            extra={"status": 422, "path": request.url.path},
        )
        return JSONResponse(
            status_code=422,
            content={"detail": exc.errors(), "request_id": request_id_var.get()},
        )

    @app.exception_handler(StarletteHTTPException)
    async def on_http_error(request: Request, exc: StarletteHTTPException):
        # 401/403/404/400 are expected outcomes; keep them one line at WARNING so they are searchable but quiet.
        level = logger.warning if exc.status_code < 500 else logger.error
        level(
            f"{request.method} {request.url.path} -> {exc.status_code}: {exc.detail}",
            extra={"status": exc.status_code, "path": request.url.path},
        )
        headers = getattr(exc, "headers", None) or {}
        body = {"detail": exc.detail, "request_id": request_id_var.get()}
        return JSONResponse(status_code=exc.status_code, content=body, headers=headers)

    # FastAPI's HTTPException subclasses Starlette's; registering both keeps precedence explicit.
    app.add_exception_handler(HTTPException, on_http_error)
