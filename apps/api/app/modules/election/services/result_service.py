import uuid
import datetime
import json
from typing import List, Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from pydantic import TypeAdapter

from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.candidate_repository import CandidateRepository
from app.modules.election.repositories.ballot_repository import BallotRepository

from app.modules.election.models.election import Election, ResultVisibility, ElectionStatus
from app.modules.election.models.ballot import BallotStatus
from app.modules.election.schemas.results import ElectionResultSchema, ElectionStatisticsSchema
from .result_engine import ResultEngine

# import redis or use memory cache if not available
# from app.core.redis import get_redis
import json
class ResultService:
    def __init__(
        self,
        db: AsyncSession,
        election_repository: ElectionRepository = None,
        category_repository: CategoryRepository = None,
        candidate_repository: CandidateRepository = None,
        ballot_repository: BallotRepository = None
    ):
        self.db = db
        self.election_repo = election_repository or ElectionRepository(db)
        self.category_repo = category_repository or CategoryRepository(db)
        self.candidate_repo = candidate_repository or CandidateRepository(db)
        self.ballot_repo = ballot_repository or BallotRepository(db)

    async def get_live_results(self, election_id: uuid.UUID, user_id: Optional[uuid.UUID] = None) -> ElectionResultSchema:
        """
        Fetch results for a live election. Validates visibility first.
        Uses Redis cache if available.
        """
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise HTTPException(status_code=404, detail="Election not found")
            
        # Check if user is an admin of this organization
        is_admin = False
        if user_id:
            from sqlalchemy import select
            from app.modules.membership.models.membership import Membership
            res = await self.db.execute(select(Membership).where(Membership.user_id == user_id, Membership.organization_id == election.organization_id))
            if res.scalar_one_or_none():
                is_admin = True

        # 1. Determine Visibility
        is_visible = True
        
        # Public requests (not admin)
        if not is_admin:
            if election.result_visibility == ResultVisibility.HIDDEN:
                is_visible = False
            elif election.result_visibility == ResultVisibility.ADMIN_ONLY:
                is_visible = False
            elif election.result_visibility == ResultVisibility.AFTER_CLOSE:
                if election.status not in (ElectionStatus.VOTING_CLOSED, ElectionStatus.COUNTING, ElectionStatus.RESULTS_PUBLISHED, ElectionStatus.ARCHIVED):
                    is_visible = False
            elif election.result_visibility == ResultVisibility.PUBLIC:
                # Same as AFTER_CLOSE for public access? Or does public mean always visible?
                # Usually PUBLIC means visible after close unless specified as LIVE. 
                # To be safe, treat PUBLIC same as AFTER_CLOSE unless they explicitly want it LIVE.
                if election.status not in (ElectionStatus.VOTING_CLOSED, ElectionStatus.COUNTING, ElectionStatus.RESULTS_PUBLISHED, ElectionStatus.ARCHIVED):
                    is_visible = False
            elif election.result_visibility == ResultVisibility.LIVE:
                # Always visible
                is_visible = True
            else:
                # Fallback to hidden if unknown
                is_visible = False
        else:
            # Admin requests
            # If the election is active (not closed/published)
            if election.status not in (ElectionStatus.VOTING_CLOSED, ElectionStatus.COUNTING, ElectionStatus.RESULTS_PUBLISHED, ElectionStatus.ARCHIVED):
                if not election.allow_admin_live_results:
                    is_visible = False
                    
        if not is_visible:
            return ElectionResultSchema(
                election_id=election_id,
                status=election.status,
                is_hidden=True,
                statistics=ElectionStatisticsSchema(
                    total_eligible_voters=None,
                    total_votes_cast=0,
                    turnout_percentage=None
                ),
                categories=[],
                generated_at=datetime.datetime.now(datetime.timezone.utc)
            )
                 
        # 3. Compute results
        return await self.compute_and_cache_results(election_id)


    async def compute_and_cache_results(self, election_id: uuid.UUID) -> ElectionResultSchema:
        """
        Computes the results dynamically, caches them in Redis, and returns the schema.
        """
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise ValueError("Election not found")

        categories = await self.category_repo.get_all_by_election(election_id)
        
        # We need candidates grouped by category
        candidates = await self.candidate_repo.get_by_election(election_id)
        cands_by_cat = {}
        for c in candidates:
            cands_by_cat.setdefault(c.election_category_id, []).append(c)
            
        # Get all VALID submitted ballots and their selections
        ballots = await self.ballot_repo.get_valid_ballots_for_election(election_id)
        valid_ballot_ids = {b.id for b in ballots}
        
        # Get all selections for these ballots
        selections = await self.ballot_repo.get_selections_for_ballots(list(valid_ballot_ids))
        sels_by_cat = {}
        for s in selections:
            sels_by_cat.setdefault(s.category_id, []).append(s)

        total_votes_cast = len(valid_ballot_ids)
        expected_voters = election.expected_voter_count
        turnout = None
        if expected_voters and expected_voters > 0:
            turnout = round((total_votes_cast / expected_voters) * 100, 2)
            
        statistics = ElectionStatisticsSchema(
            total_eligible_voters=expected_voters,
            total_votes_cast=total_votes_cast,
            turnout_percentage=turnout
        )

        category_results = []
        for cat in categories:
            calculator = ResultEngine.get_calculator(cat.voting_method)
            cat_cands = cands_by_cat.get(cat.id, [])
            cat_sels = sels_by_cat.get(cat.id, [])
            
            res_dto = calculator.calculate(cat, cat_cands, cat_sels)
            category_results.append(res_dto)

        result_schema = ElectionResultSchema(
            election_id=election.id,
            status=election.status.value,
            statistics=statistics,
            categories=category_results,
            generated_at=datetime.datetime.utcnow()
        )
        
        # Cache in Redis disabled temporarily until Redis is integrated in core
        # redis = await get_redis()
        # cache_key = f"election:{election.id}:results"
        # await redis.setex(cache_key, 3600, result_schema.model_dump_json())  # 1 hour cache
        
        return result_schema
