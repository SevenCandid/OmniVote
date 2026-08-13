import uuid
import datetime
from pydantic import BaseModel, ConfigDict, Field, EmailStr

class VoterGroupCreate(BaseModel):
    name: str = Field(..., max_length=150)
    description: str | None = Field(None, max_length=2000)

class VoterGroupResponse(BaseModel):
    id: uuid.UUID
    election_id: uuid.UUID
    name: str
    description: str | None
    created_at: datetime.datetime
    updated_at: datetime.datetime | None

    model_config = ConfigDict(from_attributes=True)

class EligibleVoterCreate(BaseModel):
    voter_identifier: str = Field(..., max_length=100)
    full_name: str = Field(..., max_length=255)
    phone_number: str | None = Field(None, max_length=50)
    email: EmailStr | None = None
    gender: str | None = Field(None, max_length=15)
    group_id: uuid.UUID | None = None

class EligibleVoterUpdate(BaseModel):
    full_name: str | None = Field(None, max_length=255)
    phone_number: str | None = Field(None, max_length=50)
    email: EmailStr | None = None
    gender: str | None = Field(None, max_length=15)
    group_id: uuid.UUID | None = None

class EligibleVoterResponse(BaseModel):
    id: uuid.UUID
    election_id: uuid.UUID
    voter_identifier: str
    full_name: str
    phone_number: str | None
    email: str | None
    gender: str | None
    group_id: uuid.UUID | None
    has_voted: bool
    created_at: datetime.datetime
    updated_at: datetime.datetime | None

    model_config = ConfigDict(from_attributes=True)

class PaginatedVoterResponse(BaseModel):
    items: list[EligibleVoterResponse]
    total: int
    skip: int
    limit: int
