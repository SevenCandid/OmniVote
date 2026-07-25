import uuid
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.election.models.ballot import Ballot, BallotSelection

class BallotRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, ballot: Ballot) -> Ballot:
        self.db.add(ballot)
        await self.db.flush()
        return ballot

    async def get_by_receipt_code(self, receipt_code: str) -> Ballot | None:
        stmt = (
            select(Ballot)
            .options(selectinload(Ballot.selections))
            .where(Ballot.receipt_code == receipt_code)
        )
        result = await self.db.execute(stmt)
        return result.scalars().first()

    async def get_valid_ballots_for_election(self, election_id: uuid.UUID) -> list[Ballot]:
        from app.modules.election.models.ballot import BallotStatus
        stmt = (
            select(Ballot)
            .where(Ballot.election_id == election_id)
            .where(Ballot.status == BallotStatus.SUBMITTED)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def get_selections_for_ballots(self, ballot_ids: list[uuid.UUID]) -> list[BallotSelection]:
        if not ballot_ids:
            return []
        stmt = select(BallotSelection).where(BallotSelection.ballot_id.in_(ballot_ids))
        result = await self.db.execute(stmt)
        return list(result.scalars().all())


class BallotSelectionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, selection: BallotSelection) -> BallotSelection:
        self.db.add(selection)
        await self.db.flush()
        return selection
