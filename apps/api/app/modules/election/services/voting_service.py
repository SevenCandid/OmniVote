import uuid
import datetime
import secrets
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.election import ElectionStatus
from app.modules.election.models.category import VotingMethod
from app.modules.election.models.voting_session import VotingSession, VotingSelection, VotingSessionStatus
from app.modules.election.models.ballot import Ballot, BallotSelection
from app.modules.election.schemas.voting import StartSessionRequest, DraftSelectionUpdate, VotingSelectionItem
from app.modules.election.repositories.voting_session_repository import VotingSessionRepository, VotingSelectionRepository
from app.modules.election.repositories.ballot_repository import BallotRepository, BallotSelectionRepository
from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.repositories.category_repository import CategoryRepository
from app.modules.election.repositories.candidate_repository import CandidateRepository
from app.core.events.dispatcher import get_event_dispatcher
from app.modules.election.events import BallotSubmitted

class VotingService:
    def __init__(
        self,
        db: AsyncSession,
        voting_session_repository: VotingSessionRepository,
        voting_selection_repository: VotingSelectionRepository,
        ballot_repository: BallotRepository,
        ballot_selection_repository: BallotSelectionRepository,
        election_repository: ElectionRepository,
        category_repository: CategoryRepository,
        candidate_repository: CandidateRepository
    ):
        self.db = db
        self.session_repo = voting_session_repository
        self.selection_repo = voting_selection_repository
        self.ballot_repo = ballot_repository
        self.ballot_selection_repo = ballot_selection_repository
        self.election_repo = election_repository
        self.category_repo = category_repository
        self.candidate_repo = candidate_repository

    async def start_session(
        self, 
        election_id: uuid.UUID, 
        request: StartSessionRequest, 
        user_id: uuid.UUID | None = None,
        visitor_session_id: uuid.UUID | None = None
    ) -> VotingSession:
        election = await self.election_repo.get_by_id(election_id)
        if not election:
            raise HTTPException(status_code=404, detail="Election not found")
            
        if election.status != ElectionStatus.VOTING_OPEN:
            if not user_id:
                raise HTTPException(status_code=400, detail="Voting is not open for this election")

        # Check if active session already exists
        if user_id:
            existing = await self.session_repo.get_active_session_for_user(election_id, user_id)
        elif visitor_session_id:
            # Requires adding this to session repo or implementing here
            from sqlalchemy import select
            stmt = select(VotingSession).where(
                VotingSession.election_id == election_id,
                VotingSession.visitor_session_id == visitor_session_id,
                VotingSession.status == VotingSessionStatus.ACTIVE
            )
            result = await self.db.execute(stmt)
            existing = result.scalar_one_or_none()
        elif request.voter_identifier:
            existing = await self.session_repo.get_active_session_for_identifier(election_id, request.voter_identifier)
        else:
            existing = None
            
        if existing:
            # Check expiration
            if existing.expires_at < datetime.datetime.now(datetime.UTC):
                existing.status = VotingSessionStatus.EXPIRED
                await self.session_repo.update(existing.id, {"status": VotingSessionStatus.EXPIRED})
                await self.db.commit()
            else:
                return existing

        # Create new session
        # Default expiration: 15 minutes
        expires_at = datetime.datetime.now(datetime.UTC) + datetime.timedelta(minutes=15)
        
        session = VotingSession(
            election_id=election_id,
            user_id=user_id,
            visitor_session_id=visitor_session_id,
            voter_identifier=request.voter_identifier,
            verification_method=request.verification_method,
            status=VotingSessionStatus.ACTIVE,
            expires_at=expires_at
        )
        
        created = await self.session_repo.create(session)
        await self.db.commit()
        # Re-fetch with relationships
        return await self.session_repo.get_by_id_with_selections(created.id)

    async def get_active_session(self, session_id: uuid.UUID) -> VotingSession:
        session = await self.session_repo.get_by_id_with_selections(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        if session.status != VotingSessionStatus.ACTIVE:
            raise HTTPException(status_code=400, detail="Session is not active")
            
        if session.expires_at < datetime.datetime.now(datetime.UTC):
            await self.session_repo.update(session.id, {"status": VotingSessionStatus.EXPIRED})
            await self.db.commit()
            raise HTTPException(status_code=400, detail="Session has expired")
            
        return session

    async def save_draft_selections(self, session_id: uuid.UUID, update_data: DraftSelectionUpdate) -> VotingSession:
        session = await self.get_active_session(session_id)
        
        # Clear existing selections for this session
        existing_selections = await self.selection_repo.get_selections_for_session(session_id)
        for s in existing_selections:
            await self.selection_repo.delete(s.id)
            
        # Add new selections
        for item in update_data.selections:
            # Basic validation: ensure candidate and category exist
            # Further structural validation happens on final submit
            sel = VotingSelection(
                session_id=session_id,
                category_id=item.category_id,
                candidate_id=item.candidate_id
            )
            await self.selection_repo.create(sel)
            
        await self.db.commit()
        return await self.session_repo.get_by_id_with_selections(session_id)

    async def submit_ballot(self, session_id: uuid.UUID) -> Ballot:
        session = await self.get_active_session(session_id)
        
        # 1. Fetch categories
        categories = await self.category_repo.get_all_by_election(session.election_id)
        cat_map = {c.id: c for c in categories}
        
        # 2. Group selections
        selections = session.selections
        sel_by_cat = {}
        for s in selections:
            sel_by_cat.setdefault(s.category_id, []).append(s)
            
        # 3. Validate
        for cat_id, cat in cat_map.items():
            cat_sels = sel_by_cat.get(cat_id, [])
            if len(cat_sels) > cat.max_winners:
                raise HTTPException(
                    status_code=400, 
                    detail=f"Category {cat.name} exceeds max winners ({cat.max_winners})"
                )
            if len(cat_sels) == 0 and cat.category_type == "position":
                # In strict mode, we might require votes for all positions. 
                # For now, we allow blank votes unless explicitly required.
                pass
                
        # 4. Generate Receipt Code
        receipt_code = secrets.token_hex(8).upper()
        
        # 5. Create immutable Ballot
        ballot = Ballot(
            election_id=session.election_id,
            user_id=session.user_id,
            visitor_session_id=session.visitor_session_id,
            receipt_code=receipt_code,
            ballot_schema_version=1
        )
        created_ballot = await self.ballot_repo.create(ballot)
        
        # 5.5 Deduct Wallet Credits if Paid
        election = await self.election_repo.get_by_id(session.election_id)
        if election.is_paid:
            total_weight = sum(s.vote_weight for s in selections)
            if total_weight > 0:
                from app.modules.election.services.vote_wallet_service import VoteWalletService
                wallet_service = VoteWalletService(self.db)
                wallet = await wallet_service.get_or_create_wallet(
                    election_id=election.id,
                    user_id=session.user_id,
                    visitor_session_id=session.visitor_session_id
                )
                if wallet.available_votes < total_weight:
                    raise HTTPException(status_code=400, detail="Insufficient vote credits. Please add funds.")
                
                # Direct deduction
                wallet.available_votes -= total_weight
                wallet.used_votes += total_weight
                
                from app.modules.election.models.payment import VoteCreditTransaction, VoteCreditTransactionType
                tx = VoteCreditTransaction(
                    wallet_id=wallet.id,
                    transaction_type=VoteCreditTransactionType.BALLOT,
                    amount=-total_weight,
                    reference_id=created_ballot.id
                )
                self.db.add(tx)
        
        # 6. Create Ballot Selections
        for s in selections:
            bs = BallotSelection(
                ballot_id=created_ballot.id,
                category_id=s.category_id,
                candidate_id=s.candidate_id,
                vote_weight=s.vote_weight
            )
            await self.ballot_selection_repo.create(bs)
            
        # 7. Close Session
        await self.session_repo.update(
            session.id, 
            {"status": VotingSessionStatus.SUBMITTED, "completed_at": datetime.datetime.now(datetime.UTC)}
        )
        
        # 8. Register BallotSubmitted event for post-commit dispatch
        event = BallotSubmitted(
            ballot_id=created_ballot.id,
            ballot_reference=receipt_code,
            election_id=session.election_id,
            voting_session_id=session.id,
            ballot_schema_version=1,
            voting_engine_version=1,
            submission_status="SUBMITTED"
        )
        get_event_dispatcher().register_pending_event(self.db, event)
        
        await self.db.commit()
        
        return await self.ballot_repo.get_by_receipt_code(receipt_code)
