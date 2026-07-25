from typing import Optional, List
import uuid
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

from app.modules.election.models.category import CategoryType, VotingMethod


class ElectionCategoryBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the category or position")
    description: Optional[str] = Field(None, max_length=2000, description="Optional description")
    category_type: CategoryType = Field(default=CategoryType.POSITION, description="Type of the category")
    max_winners: int = Field(default=1, ge=1, description="Maximum number of winners allowed")
    voting_method: VotingMethod = Field(default=VotingMethod.FIRST_PAST_THE_POST, description="Method of voting")
    display_order: Optional[int] = Field(default=None, description="Order of display")


class ElectionCategoryCreate(ElectionCategoryBase):
    pass


class ElectionCategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = Field(None, max_length=2000)
    max_winners: Optional[int] = Field(None, ge=1)
    voting_method: Optional[VotingMethod] = None


class ElectionCategoryOrderUpdate(BaseModel):
    display_order: int = Field(..., ge=0)


class ElectionCategoryResponse(ElectionCategoryBase):
    id: uuid.UUID
    election_id: uuid.UUID
    display_order: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
