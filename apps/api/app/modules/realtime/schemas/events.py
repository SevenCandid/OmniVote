import datetime
import uuid
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field


class RealtimeEvent(BaseModel):
    """
    Standard envelope for all versioned realtime events broadcast over WebSockets.
    """
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_name: str
    event_version: int = 1
    timestamp: str = Field(default_factory=lambda: datetime.datetime.now(datetime.timezone.utc).isoformat())
    channel: str
    scope: Literal["global", "platform", "organization", "election", "category", "candidate", "user", "visitor", "results", "notification"]
    payload: Dict[str, Any]


# Specific Realtime Payloads

class ElectionStateChangedPayload(BaseModel):
    election_id: str
    organization_id: str
    title: str
    previous_state: str
    new_state: str
    updated_at: str


class BallotSubmittedRealtimePayload(BaseModel):
    election_id: str
    category_id: Optional[str] = None
    timestamp: str
    anonymous: bool = True


class ResultsUpdatedPayload(BaseModel):
    election_id: str
    category_id: Optional[str] = None
    total_ballots_cast: int
    candidate_tallies: Dict[str, int]
    percentages: Dict[str, float]
    updated_at: str
    is_tied: bool = False
    leader_candidate_ids: List[str] = Field(default_factory=list)


class TurnoutUpdatedPayload(BaseModel):
    election_id: str
    total_eligible_voters: int
    votes_cast: int
    turnout_percentage: float
    votes_remaining: int
    updated_at: str


class PaymentCompletedRealtimePayload(BaseModel):
    payment_id: str
    election_id: str
    user_id: Optional[str] = None
    visitor_session_id: Optional[str] = None
    vote_credits_granted: int
    amount: float
    currency: str
    timestamp: str


class NotificationCreatedRealtimePayload(BaseModel):
    notification_id: str
    user_id: str
    title: str
    message: str
    type: str
    read: bool = False
    created_at: str


class PresenceUpdatePayload(BaseModel):
    channel: str
    online_connections: int
    online_users: int
    online_visitors: int
    timestamp: str
