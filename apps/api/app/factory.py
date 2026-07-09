from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
from app.core.logging import setup_logging
from app.api.v1.router import api_router
from app.middleware.request_context import RequestContextMiddleware
from app.exceptions.exceptions import AppException
from app.exceptions.handlers import (
    app_exception_handler,
    validation_exception_handler,
    starlette_http_exception_handler,
    general_exception_handler,
    sqlalchemy_exception_handler,
)

def create_app() -> FastAPI:
    # Configure structlog logger
    setup_logging()

    app = FastAPI(
        title=settings.PROJECT_NAME,
        description="One System. Every Vote. Powered by VeroSeven",
        version="1.0.0",
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        docs_url=f"{settings.API_V1_STR}/docs",
        redoc_url=f"{settings.API_V1_STR}/redoc",
    )

    # Register CORS Middleware matching design specifications
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Register Tracing & Request Logger Middleware
    app.add_middleware(RequestContextMiddleware)

    # Register Exception Handlers
    app.add_exception_handler(AppException, app_exception_handler)
    app.add_exception_handler(RequestValidationError, validation_exception_handler)
    app.add_exception_handler(StarletteHTTPException, starlette_http_exception_handler)
    app.add_exception_handler(SQLAlchemyError, sqlalchemy_exception_handler)
    app.add_exception_handler(Exception, general_exception_handler)

    # Register Router with Version prefix
    app.include_router(api_router, prefix=settings.API_V1_STR)

    return app
