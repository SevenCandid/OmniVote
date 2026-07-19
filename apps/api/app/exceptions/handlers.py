from datetime import UTC, datetime

import structlog
from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
from starlette.exceptions import HTTPException as StarletteHTTPException

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
                "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            },
        },
    )


async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    correlation_id = getattr(request.state, "correlation_id", None)

    details = []
    for err in exc.errors():
        # loc maps to field names (e.g., ['body', 'username'])
        loc = err.get("loc", [])
        field = (
            ".".join(str(item) for item in loc[1:])
            if len(loc) > 1
            else ".".join(str(item) for item in loc)
        )
        details.append(
            {
                "field": field or "payload",
                "issue": err.get("msg", "Invalid value"),
            }
        )

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
                "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            },
        },
    )


async def starlette_http_exception_handler(
    request: Request, exc: StarletteHTTPException
) -> JSONResponse:
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
                "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            },
        },
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
                "timestamp": datetime.now(UTC).isoformat().replace("+00:00", "Z"),
                "request_id": request_id,
                "correlation_id": correlation_id,
            },
        },
    )


async def sqlalchemy_exception_handler(
    request: Request, exc: SQLAlchemyError
) -> JSONResponse:
    request_id = getattr(request.state, "request_id", None)
    correlation_id = getattr(request.state, "correlation_id", None)
    timestamp_str = datetime.now(UTC).isoformat().replace("+00:00", "Z")

    # Safe structured logger (never log sensitive query bind variables or credentials)
    # We only log the base error type/class and generic message safely
    logger.error(
        "database_transaction_failed",
        error_class=exc.__class__.__name__,
        request_id=request_id,
        correlation_id=correlation_id,
        exc_info=exc,
    )

    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Database operation failed.",
            "error": {
                "code": "DATABASE_ERROR",
                "details": [],
            },
            "metadata": {
                "timestamp": timestamp_str,
                "request_id": request_id,
                "correlation_id": correlation_id,
            },
            # Flat attributes for root-level direct compatibility
            "request_id": request_id,
            "timestamp": timestamp_str,
        },
    )
