from typing import List
from .fptp_calculator import FPTPCalculator
from .base_calculator import CategoryResultDTO

class ApprovalCalculator(FPTPCalculator):
    """
    Approval Voting Calculator.
    In Approval Voting, voters can vote for as many candidates as they approve of.
    The mathematical counting model for results is identical to First Past The Post 
    with multiple winners (the candidate with the most approvals wins).
    We inherit from FPTPCalculator for now, but abstract it to allow future 
    divergence (e.g. approval-specific statistics).
    """
    def calculate(self, category, candidates: List, selections: List) -> CategoryResultDTO:
        # 1. Count approvals (summing vote_weight)
        vote_counts = defaultdict(int)
        for sel in selections:
            if sel.candidate_id:
                weight = getattr(sel, 'vote_weight', 1)
                vote_counts[sel.candidate_id] += weight
        return super().calculate(category, candidates, selections)
