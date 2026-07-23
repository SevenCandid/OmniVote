import pytest
from app.modules.election.services.election_edit_policy import ElectionEditPolicy
from app.modules.election.models.election import Election, ElectionStatus

def test_draft_allows_all():
    election = Election(status=ElectionStatus.DRAFT)
    update_data = {
        "title": "New Title",
        "election_type": "POLL",
        "description": "Desc"
    }
    # Should not raise
    ElectionEditPolicy.validate_update(election, update_data)

def test_published_blocks_core():
    election = Election(status=ElectionStatus.PUBLISHED, title="Old Title")
    update_data = {
        "title": "New Title" # Not allowed
    }
    with pytest.raises(ValueError) as exc:
        ElectionEditPolicy.validate_update(election, update_data)
    assert "Cannot modify the following fields" in str(exc.value)

def test_published_allows_description():
    election = Election(status=ElectionStatus.PUBLISHED, description="Old")
    update_data = {
        "description": "New Desc",
        "voting_closes_at": "2026-10-10T10:00:00Z"
    }
    # Should not raise
    ElectionEditPolicy.validate_update(election, update_data)

def test_voting_open_blocks_results_publish_at():
    election = Election(status=ElectionStatus.VOTING_OPEN)
    update_data = {
        "results_publish_at": "2026-10-10T10:00:00Z"
    }
    with pytest.raises(ValueError):
        ElectionEditPolicy.validate_update(election, update_data)

def test_no_changes_doesnt_raise():
    election = Election(status=ElectionStatus.PUBLISHED, title="Same Title")
    update_data = {
        "title": "Same Title" # Identical value, shouldn't complain
    }
    # Should not raise
    ElectionEditPolicy.validate_update(election, update_data)
