from typing import Set, Dict, Any, TYPE_CHECKING
from app.modules.election.models.election import ElectionStatus

if TYPE_CHECKING:
    from app.modules.election.models.election import Election

class ElectionEditPolicy:
    """
    Centralized policy for determining which fields of an election 
    can be modified based on its current lifecycle state.
    """

    @classmethod
    def get_allowed_fields(cls, status: ElectionStatus) -> Set[str]:
        if status in (ElectionStatus.DRAFT, ElectionStatus.CONFIGURED):
            return {
                "title", "description", "election_type", "visibility",
                "time_zone", "allow_anonymous_voting", "automatically_publish_results",
                "require_voter_verification", "registration_opens_at", 
                "registration_closes_at", "voting_opens_at", 
                "voting_closes_at", "results_publish_at"
            }
        elif status == ElectionStatus.PUBLISHED:
            return {
                "description",
                "voting_closes_at",
                "results_publish_at"
            }
        elif status in (ElectionStatus.VOTING_OPEN, ElectionStatus.VOTING_PAUSED):
            return {
                "description",
                "voting_closes_at"
            }
        # For VOTING_CLOSED, RESULTS_PUBLISHED, ARCHIVED, CANCELLED
        return set()

    @classmethod
    def validate_update(cls, election: 'Election', update_data: Dict[str, Any]) -> None:
        """
        Validates whether the update_data contains fields that are not allowed 
        to be modified in the current election status.
        Raises ValueError if an invalid field is being updated.
        """
        if not update_data:
            return

        allowed_fields = cls.get_allowed_fields(election.status)
        
        # Check if there are keys in update_data that are not in allowed_fields
        # but only complain if their value is actually different from the current value
        invalid_fields = []
        for key, value in update_data.items():
            if key not in allowed_fields:
                current_val = getattr(election, key, None)
                # If they are trying to change it, it's invalid
                if current_val != value:
                    invalid_fields.append(key)
        
        if invalid_fields:
            raise ValueError(
                f"Cannot modify the following fields in status '{election.status.value}': {', '.join(invalid_fields)}"
            )
