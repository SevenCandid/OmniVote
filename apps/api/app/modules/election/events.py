import uuid
from typing import Optional
from app.core.events.base import Event

class BallotSubmitted(Event):
    ballot_id: uuid.UUID
    ballot_reference: str
    election_id: uuid.UUID
    voting_session_id: uuid.UUID
    ballot_schema_version: int
    voting_engine_version: int
    submission_status: str
