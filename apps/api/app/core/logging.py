import logging
import sys

import structlog

from app.core.config import settings


def setup_logging() -> None:
    # Clear existing handlers
    logging.root.handlers = []

    shared_processors = [
        structlog.contextvars.merge_contextvars,
        structlog.processors.add_log_level,
        structlog.processors.format_exc_info,
        structlog.processors.TimeStamper(fmt="iso", utc=True),
    ]

    if settings.ENV == "development":
        # Development: Output readable logs to console
        processors = shared_processors + [structlog.dev.ConsoleRenderer()]
    else:
        # Production: Output structured JSON logs to console
        processors = shared_processors + [
            structlog.processors.dict_tracebacks,
            structlog.processors.JSONRenderer(),
        ]

    structlog.configure(
        processors=processors,
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )

    # Set base logging level
    log_level = logging.DEBUG if settings.DEBUG else logging.INFO
    logging.basicConfig(
        format="%(message)s",
        stream=sys.stdout,
        level=log_level,
    )
