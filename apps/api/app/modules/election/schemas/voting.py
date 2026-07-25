from pydantic import BaseModel, Field
import uuid
from typing import List, Dict, Optional
from datetime import datetime

from app.modules.election.models.voting_session import VotingSessionStatus, VerificationMethod
from app.modules.election.models.category import VotingMethod


class StartSessionRequest(BaseModel):
    verification_method: VerificationMethod = Field(default=VerificationMethod.PUBLIC)
    voter_identifier: Optional[str] = Field(None, description="Identifier for unauthenticated users")

class VotingSelectionItem(BaseModel):
    category_id: uuid.UUID
    candidate_id: uuid.UUID

class DraftSelectionUpdate(BaseModel):
    selections: List[VotingSelectionItem]

class BallotReviewItem(BaseModel):
    category_id: uuid.UUID
    category_name: str
    selected_candidates: List[dict] # Contains candidate details: id, full_name, photo

class BallotReview(BaseModel):
    session_id: uuid.UUID
    election_id: uuid.UUID
    review_items: List[BallotReviewItem]

class SubmitBallotRequest(BaseModel):
    # This is an intentional minimal request, as the backend pulls from the session's draft selections
    pass

class SubmitBallotResponse(BaseModel):
    receipt_code: str
    cast_at: datetime

class VotingSessionResponse(BaseModel):
    id: uuid.UUID
    election_id: uuid.UUID
    status: VotingSessionStatus
    expires_at: datetime
    selections: List[VotingSelectionItem] = []

    class Config:
        from_attributes = True
