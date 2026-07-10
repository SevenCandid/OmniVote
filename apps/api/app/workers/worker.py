import structlog

from app.workers.jobs import example_job
from app.workers.settings import arq_redis_settings

logger = structlog.get_logger()


async def startup(ctx):
    """Callback triggered on worker daemon initialization."""
    logger.info("worker_startup_success", arq_version="0.28.0")


async def shutdown(ctx):
    """Callback triggered on worker daemon shutdown."""
    logger.info("worker_shutdown_commencing")


class WorkerSettings:
    """
    Configuration defaults for the Arq worker instance.
    Registered job functions and background limits are defined here.
    """

    # Registered background tasks (discovered by worker on startup)
    functions = [example_job]

    # Redis configuration settings
    redis_settings = arq_redis_settings

    # Queue configuration defaults (defaults to high queue; override via CLI if needed)
    queue_name = "arq:queue:high"

    # High-performance scaling boundaries
    max_jobs = 50
    job_timeout = 300  # 5 minutes maximum runtime
    keep_result = 600  # Retain execution receipts for 10 minutes

    # Job Retries policy foundation
    max_tries = 5  # Maximum processing attempts before permanent failure

    # Worker hooks
    on_startup = startup
    on_shutdown = shutdown
