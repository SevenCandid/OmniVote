from datetime import datetime, timezone
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import structlog
from app.exceptions.exceptions import AppException

logger = structlog.get_logger()

async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    correlation_id = getattr(request.state, "correlation_id", None)

    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
            "error": {
                "code": exc.code,
                "details": exc.details,
            },
            "metadata": {
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            }
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    correlation_id = getattr(request.state, "correlation_id", None)

    details = []
    for err in exc.errors():
        # loc maps to field names (e.g., ['body', 'username'])
        loc = err.get("loc", [])
        field = ".".join(str(item) for item in loc[1:]) if len(loc) > 1 else ".".join(str(item) for item in loc)
        details.append({
            "field": field or "payload",
            "issue": err.get("msg", "Invalid value"),
        })

    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation failed on input parameters.",
            "error": {
                "code": "VALIDATION_ERROR",
                "details": details,
            },
            "metadata": {
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            }
        }
    )

async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    correlation_id = getattr(request.state, "correlation_id", None)

    code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.detail,
            "error": {
                "code": code,
                "details": [],
            },
            "metadata": {
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            }
        }
    )

async def general_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    correlation_id = getattr(request.state, "correlation_id", None)

    logger.error("unexpected_server_error", error=str(exc), exc_info=True)

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "An unexpected error occurred on the server.",
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "details": [],
            },
            "metadata": {
                "timestamp": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            }
        }
    )
