import structlog

logger = structlog.get_logger()

async def example_job(ctx) -> str:
    """
    Verification placeholder job to check arq integration.
    Prints task parameters to standard logs, verifying context bindings.
    """
    logger.info("executing_example_job", job_id=ctx.get("job_id"))
    return "example_job_completed"
