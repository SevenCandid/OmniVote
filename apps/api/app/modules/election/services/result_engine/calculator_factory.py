from app.modules.election.models.category import VotingMethod
from .base_calculator import BaseCalculator
from .fptp_calculator import FPTPCalculator
from .approval_calculator import ApprovalCalculator

class ResultEngine:
    @staticmethod
    def get_calculator(voting_method: VotingMethod) -> BaseCalculator:
        """
        Factory to return the appropriate result calculator based on the voting method.
        """
        if voting_method == VotingMethod.FIRST_PAST_THE_POST:
            return FPTPCalculator()
        elif voting_method == VotingMethod.APPROVAL:
            return ApprovalCalculator()
        else:
            # Fallback to FPTP for unsupported methods temporarily
            return FPTPCalculator()
