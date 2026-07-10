import time
import uuid

import structlog
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

logger = structlog.get_logger()


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        # Traceability: Propagate request_id and correlation_id parameters
        request_id = request.headers.get("X-Request-ID") or f"req-{uuid.uuid4()}"
        correlation_id = (
            request.headers.get("X-Correlation-ID") or f"corr-{uuid.uuid4()}"
        )

        # Attach to request state for use in exception handlers or endpoints
        request.state.request_id = request_id
        request.state.correlation_id = correlation_id

        # Bind parameters to the structlog context variable for logging
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(
            request_id=request_id,
            correlation_id=correlation_id,
            method=request.method,
            path=request.url.path,
        )

        start_time = time.perf_counter()
        logger.info("request_started")

        try:
            response = await call_next(request)
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.info(
                "request_completed",
                status_code=response.status_code,
                duration_ms=duration_ms,
            )

            # Set tracing headers in response
            response.headers["X-Request-ID"] = request_id
            response.headers["X-Correlation-ID"] = correlation_id
            return response
        except Exception as exc:
            duration_ms = (time.perf_counter() - start_time) * 1000.0
            logger.error("request_failed", error=str(exc), duration_ms=duration_ms)
            raise exc
