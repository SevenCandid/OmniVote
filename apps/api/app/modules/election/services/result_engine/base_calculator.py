from abc import ABC, abstractmethod
from typing import List
from pydantic import BaseModel
import uuid

class CandidateResultDTO(BaseModel):
    candidate_id: uuid.UUID
    name: str
    photo: str | None
    vote_count: int
    percentage: float
    rank: int
    is_winner: bool
    is_tied: bool

class CategoryResultDTO(BaseModel):
    category_id: uuid.UUID
    name: str
    total_votes: int
    candidates: List[CandidateResultDTO]

class BaseCalculator(ABC):
    @abstractmethod
    def calculate(self, category, candidates: List, selections: List) -> CategoryResultDTO:
        """
        Calculate results for a specific category.
        :param category: The ElectionCategory object.
        :param candidates: List of ElectionCandidate objects for this category.
        :param selections: List of valid BallotSelection objects for this category.
        :return: CategoryResultDTO
        """
        pass
