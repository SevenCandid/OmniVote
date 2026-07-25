import pytest
import uuid
from types import SimpleNamespace
from app.modules.election.services.result_engine.fptp_calculator import FPTPCalculator

def test_fptp_calculator_basic_counting():
    calculator = FPTPCalculator()
    
    # Mock category
    category = SimpleNamespace(id=uuid.uuid4(), name="President", max_winners=1)
    
    # Mock candidates
    cand1 = SimpleNamespace(id=uuid.uuid4(), full_name="Alice", photo=None)
    cand2 = SimpleNamespace(id=uuid.uuid4(), full_name="Bob", photo=None)
    candidates = [cand1, cand2]
    
    # Mock selections
    selections = [
        SimpleNamespace(candidate_id=cand1.id),
        SimpleNamespace(candidate_id=cand1.id),
        SimpleNamespace(candidate_id=cand2.id),
    ]
    
    result = calculator.calculate(category, candidates, selections)
    
    assert result.total_votes == 3
    assert len(result.candidates) == 2
    
    alice_res = next(c for c in result.candidates if c.candidate_id == cand1.id)
    bob_res = next(c for c in result.candidates if c.candidate_id == cand2.id)
    
    assert alice_res.vote_count == 2
    assert alice_res.percentage == pytest.approx(66.67)
    assert alice_res.rank == 1
    assert alice_res.is_winner is True
    assert alice_res.is_tied is False
    
    assert bob_res.vote_count == 1
    assert bob_res.percentage == pytest.approx(33.33)
    assert bob_res.rank == 2
    assert bob_res.is_winner is False
    assert bob_res.is_tied is False

def test_fptp_calculator_ties():
    calculator = FPTPCalculator()
    category = SimpleNamespace(id=uuid.uuid4(), name="President", max_winners=1)
    cand1 = SimpleNamespace(id=uuid.uuid4(), full_name="Alice", photo=None)
    cand2 = SimpleNamespace(id=uuid.uuid4(), full_name="Bob", photo=None)
    candidates = [cand1, cand2]
    selections = [
        SimpleNamespace(candidate_id=cand1.id),
        SimpleNamespace(candidate_id=cand2.id),
    ]
    
    result = calculator.calculate(category, candidates, selections)
    assert result.total_votes == 2
    
    alice_res = next(c for c in result.candidates if c.candidate_id == cand1.id)
    bob_res = next(c for c in result.candidates if c.candidate_id == cand2.id)
    
    assert alice_res.vote_count == 1
    assert bob_res.vote_count == 1
    assert alice_res.rank == 1
    assert bob_res.rank == 1
    assert alice_res.is_tied is True
    assert bob_res.is_tied is True
    # Both are at rank 1, max_winners=1
    assert alice_res.is_winner is True
    assert bob_res.is_winner is True
