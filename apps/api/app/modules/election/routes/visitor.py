from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid
from pydantic import BaseModel
from typing import Optional

from app.database.session import get_db_session
from app.modules.election.services.visitor_service import VisitorService

router = APIRouter()

class VisitorSessionResponse(BaseModel):
    visitor_token: str
    expires_at: str

@router.post("/visitor-session/{election_id}")
async def create_visitor_session(
    election_id: uuid.UUID,
    response: Response,
    db: AsyncSession = Depends(get_db_session)
):
    service = VisitorService(db)
    session = await service.create_visitor_session(election_id=election_id)
    await db.commit()
    
    # Set HttpOnly cookie
    response.set_cookie(
        key="visitor_token",
        value=session.visitor_token,
        httponly=True,
        secure=True,
        samesite="lax",
        max_age=7 * 24 * 3600
    )
    
    return {"status": "success", "visitor_token": session.visitor_token}

from app.modules.election.repositories.election_repository import ElectionRepository
from app.modules.election.repositories.candidate_repository import CandidateRepository
from app.modules.election.repositories.category_repository import CategoryRepository

@router.get("/elections/{election_id}")
async def get_public_election(
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session)
):
    repo = ElectionRepository(db)
    election = await repo.get_by_id(election_id)
    if not election:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Election not found")
    
    return {
        "id": election.id,
        "title": election.title,
        "description": election.description,
        "start_date": election.start_date,
        "end_date": election.end_date,
        "status": election.status,
        "election_type": election.election_type,
        "is_paid": getattr(election, "is_paid", False),
        "cost_per_vote": float(getattr(election, "cost_per_vote", 0) or 0),
        "currency": getattr(election, "currency", "USD"),
        "min_payment": float(getattr(election, "min_payment", 0) or 0),
        "max_payment": float(getattr(election, "max_payment", 0) or 0),
        "preset_amounts": getattr(election, "preset_amounts", []),
        "allow_custom_amount": getattr(election, "allow_custom_amount", True),
        "public_verification_method": getattr(election, "public_verification_method", "NONE")
    }

@router.get("/elections/{election_id}/candidates/{candidate_id}")
async def get_public_candidate(
    election_id: uuid.UUID,
    candidate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session)
):
    repo = CandidateRepository(db)
    candidate = await repo.get_by_id(candidate_id)
    if not candidate or candidate.election_id != election_id:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Candidate not found")
        
    return {
        "id": candidate.id,
        "category_id": candidate.category_id,
        "first_name": candidate.first_name,
        "last_name": candidate.last_name,
        "full_name": candidate.full_name,
        "biography": candidate.biography,
        "photo_url": candidate.photo_url,
        "metadata": candidate.metadata_
    }

@router.get("/elections/{election_id}/categories")
async def get_public_categories(
    election_id: uuid.UUID,
    db: AsyncSession = Depends(get_db_session)
):
    repo = CategoryRepository(db)
    categories = await repo.get_by_election_id(election_id)
    
    # Also fetch candidates for these categories to return a complete ballot view
    candidate_repo = CandidateRepository(db)
    candidates = await candidate_repo.get_by_election_id(election_id)
    
    # Group candidates by category
    from collections import defaultdict
    candidates_by_category = defaultdict(list)
    for c in candidates:
        candidates_by_category[c.category_id].append({
            "id": c.id,
            "category_id": c.category_id,
            "first_name": c.first_name,
            "last_name": c.last_name,
            "full_name": c.full_name,
            "biography": c.biography,
            "photo_url": c.photo_url,
        })
        
    result = []
    for cat in categories:
        result.append({
            "id": cat.id,
            "election_id": cat.election_id,
            "name": cat.name,
            "description": cat.description,
            "max_selections": cat.max_selections,
            "display_order": cat.display_order,
            "candidates": candidates_by_category.get(cat.id, [])
        })
        
    return result
