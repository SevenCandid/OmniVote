import pytest
from app.modules.election.services.result_engine.fptp_calculator import FPTPCalculator
from app.modules.election.services.result_engine.approval_calculator import ApprovalCalculator
from app.modules.election.models.voting_session import VotingSelection

@pytest.fixture
def fptp_calculator():
    return FPTPCalculator()

@pytest.fixture
def approval_calculator():
    return ApprovalCalculator()

def test_fptp_calculator_with_vote_weight(fptp_calculator):
    selections = [
        VotingSelection(candidate_id="c1", category_id="cat1", vote_weight=1),
        VotingSelection(candidate_id="c1", category_id="cat1", vote_weight=3),
        VotingSelection(candidate_id="c2", category_id="cat1", vote_weight=2),
    ]
    
    results = fptp_calculator.calculate(selections)
    
    assert "c1" in results
    assert results["c1"] == 4
    
    assert "c2" in results
    assert results["c2"] == 2

def test_approval_calculator_with_vote_weight(approval_calculator):
    selections = [
        VotingSelection(candidate_id="c1", category_id="cat1", vote_weight=5),
        VotingSelection(candidate_id="c2", category_id="cat1", vote_weight=5),
        VotingSelection(candidate_id="c1", category_id="cat1", vote_weight=2),
    ]
    
    results = approval_calculator.calculate(selections)
    
    assert "c1" in results
    assert results["c1"] == 7
    
    assert "c2" in results
    assert results["c2"] == 5
