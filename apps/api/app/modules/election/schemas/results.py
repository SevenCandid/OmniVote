from pydantic import BaseModel, ConfigDict
import uuid
from typing import List
from datetime import datetime

class CandidateResultSchema(BaseModel):
    candidate_id: uuid.UUID
    name: str
    photo: str | None
    vote_count: int
    percentage: float
    rank: int
    is_winner: bool
    is_tied: bool

    model_config = ConfigDict(from_attributes=True)

class CategoryResultSchema(BaseModel):
    category_id: uuid.UUID
    name: str
    total_votes: int
    candidates: List[CandidateResultSchema]

    model_config = ConfigDict(from_attributes=True)

class ElectionStatisticsSchema(BaseModel):
    total_eligible_voters: int | None
    total_votes_cast: int
    turnout_percentage: float | None

class ElectionResultSchema(BaseModel):
    election_id: uuid.UUID
    status: str
    statistics: ElectionStatisticsSchema
    categories: List[CategoryResultSchema]
    generated_at: datetime
