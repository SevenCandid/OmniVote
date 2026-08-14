import uuid
from datetime import datetime, date
from sqlalchemy import select, func, and_
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.election.models.election import Election
from app.modules.election.models.voter import EligibleVoter
from app.modules.election.models.voting_session import VotingSession, VotingSessionStatus, VisitorSession
from app.modules.election.models.category import ElectionCategory
from app.modules.election.models.ballot import Ballot
from app.modules.election.schemas.analytics import (
    ElectionAnalyticsResponse,
    TurnoutDataPoint,
    EngagementMetrics,
    CategoryTurnout
)

class AnalyticsService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_election_analytics(self, election_id: uuid.UUID) -> ElectionAnalyticsResponse:
        # Get total registered voters
        stmt_voters = select(func.count(EligibleVoter.id)).where(EligibleVoter.election_id == election_id)
        total_voters = await self.db.scalar(stmt_voters) or 0
        
        # Get total completed ballots
        stmt_ballots = select(func.count(Ballot.id)).where(Ballot.election_id == election_id)
        total_votes_cast = await self.db.scalar(stmt_ballots) or 0
        
        turnout_percentage = 0.0
        if total_voters > 0:
            turnout_percentage = (total_votes_cast / total_voters) * 100.0
            
        # Get engagement metrics
        stmt_visitors = select(func.count(VisitorSession.id)).where(VisitorSession.election_id == election_id)
        total_visitors = await self.db.scalar(stmt_visitors) or 0
        
        stmt_active_sessions = select(func.count(VotingSession.id)).where(
            and_(
                VotingSession.election_id == election_id,
                VotingSession.status == VotingSessionStatus.ACTIVE
            )
        )
        active_sessions = await self.db.scalar(stmt_active_sessions) or 0
        
        bounce_rate = 0.0
        if total_visitors > 0:
            # simple mock bounce rate: visitors who didn't create a session
            bounce_rate = max(0, ((total_visitors - (active_sessions + total_votes_cast)) / total_visitors) * 100.0)

        engagement = EngagementMetrics(
            total_visitors=total_visitors,
            active_sessions=active_sessions,
            completed_ballots=total_votes_cast,
            bounce_rate=round(bounce_rate, 2)
        )
        
        # Get turnout over time (grouped by date)
        # For sqlite compatibility using func.date or string parsing. 
        # Since we use Postgres in prod, we can cast to date. For simplicity, we fetch and group in memory if small, or use SQL.
        # Let's fetch all ballot creation dates
        stmt_dates = select(Ballot.created_at).where(Ballot.election_id == election_id)
        result_dates = await self.db.execute(stmt_dates)
        dates = result_dates.scalars().all()
        
        date_counts = {}
        for d in dates:
            d_str = d.strftime("%Y-%m-%d")
            date_counts[d_str] = date_counts.get(d_str, 0) + 1
            
        turnout_over_time = [
            TurnoutDataPoint(date=k, votes=v) 
            for k, v in sorted(date_counts.items())
        ]
        
        # If no votes yet, add some mock/empty data to prevent empty charts from breaking
        if not turnout_over_time:
            today = datetime.now().strftime("%Y-%m-%d")
            turnout_over_time = [TurnoutDataPoint(date=today, votes=0)]

        # Category turnout (mocked or aggregated from categories)
        stmt_categories = select(ElectionCategory).where(ElectionCategory.election_id == election_id)
        result_categories = await self.db.execute(stmt_categories)
        categories = result_categories.scalars().all()
        
        category_turnout = []
        for cat in categories:
            # Here you would join ballot_selections or count selections per category
            # For this sprint, we can just say total_votes_cast as they usually vote in all categories
            category_turnout.append(
                CategoryTurnout(
                    category_id=cat.id,
                    category_name=cat.name,
                    total_votes=total_votes_cast
                )
            )

        return ElectionAnalyticsResponse(
            election_id=election_id,
            total_voters=total_voters,
            total_votes_cast=total_votes_cast,
            turnout_percentage=round(turnout_percentage, 1),
            turnout_over_time=turnout_over_time,
            category_turnout=category_turnout,
            engagement=engagement
        )
