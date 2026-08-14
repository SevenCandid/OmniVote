import uuid
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel

class TurnoutDataPoint(BaseModel):
    date: str
    votes: int

class EngagementMetrics(BaseModel):
    total_visitors: int
    active_sessions: int
    completed_ballots: int
    bounce_rate: float

class CategoryTurnout(BaseModel):
    category_id: uuid.UUID
    category_name: str
    total_votes: int

class ElectionAnalyticsResponse(BaseModel):
    election_id: uuid.UUID
    total_voters: int
    total_votes_cast: int
    turnout_percentage: float
    
    turnout_over_time: List[TurnoutDataPoint]
    category_turnout: List[CategoryTurnout]
    engagement: EngagementMetrics

    model_config = {
        "from_attributes": True
    }
