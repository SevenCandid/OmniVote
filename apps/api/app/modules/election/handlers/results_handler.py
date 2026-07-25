import logging
from app.core.events.base import EventHandler
from app.modules.election.events import BallotSubmitted
from arq import create_pool
from app.workers.settings import arq_redis_settings

logger = logging.getLogger(__name__)

class ResultsUpdateHandler(EventHandler[BallotSubmitted]):
    async def handle(self, event: BallotSubmitted) -> None:
        logger.info(f"ResultsUpdateHandler processing event for election {event.election_id}")
        try:
            # Enqueue ARQ job directly as it was previously done in VotingService
            redis_pool = await create_pool(arq_redis_settings)
            await redis_pool.enqueue_job("update_election_results_task", str(event.election_id))
            await redis_pool.close()
        except Exception as e:
            logger.error(f"Failed to enqueue result update for election {event.election_id}: {e}")
            raise  # Re-raise so dispatcher logs it and it doesn't affect other handlers
