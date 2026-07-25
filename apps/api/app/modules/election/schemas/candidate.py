from typing import Optional, List
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, computed_field

from app.modules.election.models.candidate import CandidateStatus

class ElectionCandidateBase(BaseModel):
    full_name: str = Field(..., max_length=255, description="Full name of the candidate")
    short_name: Optional[str] = Field(None, max_length=100, description="Short name or nickname")
    photo: Optional[str] = Field(None, max_length=1000, description="URL or path to candidate photo")
    bio: Optional[str] = Field(None, description="Biography")
    manifesto: Optional[str] = Field(None, description="Candidate manifesto")

class ElectionCandidateCreate(ElectionCandidateBase):
    candidate_number: Optional[int] = Field(None, ge=1, description="Official ballot number. If not provided, will be auto-generated.")

class ElectionCandidateUpdate(BaseModel):
    full_name: Optional[str] = Field(None, max_length=255)
    short_name: Optional[str] = Field(None, max_length=100)
    photo: Optional[str] = Field(None, max_length=1000)
    bio: Optional[str] = None
    manifesto: Optional[str] = None
    status: Optional[CandidateStatus] = None

class ElectionCandidateReorder(BaseModel):
    new_candidate_number: int = Field(..., ge=1, description="The new candidate number/ballot order")

class ElectionCandidateResponse(ElectionCandidateBase):
    id: uuid.UUID
    election_category_id: uuid.UUID
    candidate_number: int
    status: CandidateStatus
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def profile_completeness(self) -> int:
        fields_to_check = [
            self.photo,
            self.bio,
            self.manifesto,
            self.candidate_number
        ]
        present = sum(1 for f in fields_to_check if f is not None and str(f).strip() != "")
        return int((present / len(fields_to_check)) * 100)

    model_config = ConfigDict(from_attributes=True)
