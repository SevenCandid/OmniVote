import uuid
from typing import Dict, Any

from app.database.session import async_session_factory
from app.modules.election.services.result_service import ResultService
from app.modules.election.repositories.election_repository import ElectionRepository

async def update_election_results_task(ctx: Dict[str, Any], election_id: str | uuid.UUID) -> None:
    """
    Background job to incrementally update or recalculate the results of an election.
    Called when a new ballot is submitted for a LIVE election.
    """
    if isinstance(election_id, str):
        election_id = uuid.UUID(election_id)
        
    # We must instantiate a new DB session for the worker task
    async with async_session_factory() as db_session:
        # We assume ResultService dependencies. We might need a factory or manual instantiation.
        from app.modules.election.repositories.election_repository import ElectionRepository
        from app.modules.election.repositories.category_repository import ElectionCategoryRepository
        from app.modules.election.repositories.candidate_repository import CandidateRepository
        from app.modules.election.repositories.ballot_repository import BallotRepository
        
        result_service = ResultService(
            db=db_session,
            election_repository=ElectionRepository(db_session),
            category_repository=ElectionCategoryRepository(db_session),
            candidate_repository=CandidateRepository(db_session),
            ballot_repository=BallotRepository(db_session),
        )
        
        # This will compute and cache the results
        await result_service.compute_and_cache_results(election_id)
