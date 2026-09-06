# app/Middleware/request_logging.py
# Per-request id, timing, access line, slow-request warning, and a safe 500 for unhandled errors.
import asyncio
import time
import uuid

from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.Utils.Logger import logger, request_id_var
from app.Utils.Net import safe_ip

REQUEST_ID_HEADER = "X-Request-ID"
SLOW_REQUEST_MS = 1000
_QUIET_PATHS = {"/health", "/health/ready"}


def _client_ip(request: Request) -> str | None:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return safe_ip(request.client.host if request.client else None)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint):
        request_id = request.headers.get(REQUEST_ID_HEADER) or uuid.uuid4().hex[:12]
        token = request_id_var.set(request_id)
        started = time.perf_counter()
        fields = {"method": request.method, "path": request.url.path, "ip": _client_ip(request)}
        if request.url.query:
            fields["query"] = request.url.query[:300]
        try:
            response = await call_next(request)
        except asyncio.CancelledError:
            raise
        except Exception as exc:
            elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
            logger.exception(
                f"{request.method} {request.url.path} -> 500 in {elapsed_ms}ms: {type(exc).__name__}: {exc}",
                extra={**fields, "status": 500, "ms": elapsed_ms},
            )
            return JSONResponse(
                status_code=500,
                content={"detail": "Internal Server Error", "request_id": request_id},
                headers={REQUEST_ID_HEADER: request_id},
            )
        finally:
            request_id_var.reset(token)

        elapsed_ms = round((time.perf_counter() - started) * 1000, 1)
        response.headers[REQUEST_ID_HEADER] = request_id
        line = f"{request.method} {request.url.path} -> {response.status_code} in {elapsed_ms}ms"
        extra = {**fields, "status": response.status_code, "ms": elapsed_ms}
        request_id_var.set(request_id)
        try:
            if elapsed_ms >= SLOW_REQUEST_MS:
                logger.warning(f"SLOW {line}", extra=extra)
            elif request.url.path in _QUIET_PATHS:
                logger.debug(line, extra=extra)
            elif response.status_code >= 500:
                logger.error(line, extra=extra)
            else:
                logger.info(line, extra=extra)
        finally:
            request_id_var.set(None)
        return response
