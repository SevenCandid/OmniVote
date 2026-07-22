import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator, model_validator

from app.modules.election.models.election import ElectionStatus, ElectionType, Visibility


class ElectionBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=255, description="The title of the election.")
    description: Optional[str] = Field(None, max_length=2000, description="A description of the election.")
    election_type: ElectionType = Field(default=ElectionType.CUSTOM, description="The type of the election.")
    visibility: Visibility = Field(default=Visibility.PRIVATE, description="The visibility level of the election.")
    
    # Scheduling
    registration_opens_at: Optional[datetime] = None
    registration_closes_at: Optional[datetime] = None
    voting_opens_at: Optional[datetime] = None
    voting_closes_at: Optional[datetime] = None
    results_publish_at: Optional[datetime] = None

    # Configuration
    timezone: str = Field(default="UTC", description="The timezone for the election schedule.")
    allow_anonymous_voting: bool = Field(default=False, description="Whether anonymous voting is allowed.")
    automatically_publish_results: bool = Field(default=False, description="Whether results are automatically published when voting closes.")
    require_voter_verification: bool = Field(default=False, description="Whether voters require explicit verification before casting a ballot.")

    @model_validator(mode='after')
    def validate_schedule(self) -> 'ElectionBase':
        # Registration logic
        if self.registration_opens_at and self.registration_closes_at:
            if self.registration_opens_at >= self.registration_closes_at:
                raise ValueError("Registration open time must be before registration close time.")
        
        # Voting logic
        if self.voting_opens_at and self.voting_closes_at:
            if self.voting_opens_at >= self.voting_closes_at:
                raise ValueError("Voting open time must be before voting close time.")
            
            # If registration closes, it should ideally be before voting closes
            if self.registration_closes_at and self.registration_closes_at > self.voting_closes_at:
                raise ValueError("Registration close time cannot be after voting close time.")
                
        # Results logic
        if self.results_publish_at and self.voting_closes_at:
            if self.results_publish_at < self.voting_closes_at:
                raise ValueError("Results publish time cannot be before voting closes.")

        return self


class ElectionCreate(ElectionBase):
    pass


class ElectionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=3, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    election_type: Optional[ElectionType] = None
    visibility: Optional[Visibility] = None
    
    registration_opens_at: Optional[datetime] = None
    registration_closes_at: Optional[datetime] = None
    voting_opens_at: Optional[datetime] = None
    voting_closes_at: Optional[datetime] = None
    results_publish_at: Optional[datetime] = None
    
    timezone: Optional[str] = None
    allow_anonymous_voting: Optional[bool] = None
    automatically_publish_results: Optional[bool] = None
    require_voter_verification: Optional[bool] = None

    @model_validator(mode='after')
    def validate_schedule(self) -> 'ElectionUpdate':
        if self.registration_opens_at and self.registration_closes_at:
            if self.registration_opens_at >= self.registration_closes_at:
                raise ValueError("Registration open time must be before registration close time.")
                
        if self.voting_opens_at and self.voting_closes_at:
            if self.voting_opens_at >= self.voting_closes_at:
                raise ValueError("Voting open time must be before voting close time.")
                
        if self.results_publish_at and self.voting_closes_at:
            if self.results_publish_at < self.voting_closes_at:
                raise ValueError("Results publish time cannot be before voting closes.")
        return self


class ElectionResponse(ElectionBase):
    id: uuid.UUID
    organization_id: uuid.UUID
    slug: str
    public_id: str
    status: ElectionStatus
    
    created_at: datetime
    updated_at: Optional[datetime] = None
    created_by: Optional[uuid.UUID] = None

    model_config = {
        "from_attributes": True
    }


class PaginatedElectionResponse(BaseModel):
    items: list[ElectionResponse]
    total: int
    skip: int
    limit: int
