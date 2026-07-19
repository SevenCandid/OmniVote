from fastapi import HTTPException, status

class MembershipException(HTTPException):
    pass

class DuplicateMembershipException(MembershipException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_409_CONFLICT,
            detail="User is already a member of this organization."
        )

class InvalidStateTransitionException(MembershipException):
    def __init__(self, message: str):
        super().__init__(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )

class MembershipNotFoundException(MembershipException):
    def __init__(self):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Membership not found."
        )
