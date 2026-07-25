import uuid
from pydantic import BaseModel
from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import get_db_session

from app.identity.api.dependencies import get_current_user_optional
from app.identity.models.user import User

from app.modules.election.services.payment_service import PaymentService
from app.modules.election.models.payment import PaymentStatus

router = APIRouter()

class InitiatePaymentRequest(BaseModel):
    amount: float
    currency: str
    provider: str

class InitiatePaymentResponse(BaseModel):
    id: uuid.UUID
    reference: str
    status: PaymentStatus

@router.post("/voting/payments/{election_id}", response_model=InitiatePaymentResponse)
async def initiate_payment(
    election_id: uuid.UUID,
    request: InitiatePaymentRequest,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db_session)
):
    payment_service = PaymentService(db)
    # Ideally visitor_session_id should be extracted from cookies here.
    # For now we'll leave it None and let the wallet link to user_id or handle it in testing.
    payment = await payment_service.initiate_payment(
        election_id=election_id,
        amount=request.amount,
        currency=request.currency,
        provider=request.provider,
        user_id=current_user.id if current_user else None,
        visitor_session_id=None 
    )
    # Commit transaction to persist payment
    await db.commit()
    
    return InitiatePaymentResponse(
        id=payment.id,
        reference=payment.reference,
        status=payment.status
    )

@router.post("/voting/payments/verify/{reference}")
async def verify_payment(
    reference: str,
    provider: str = "mock",
    cost_per_vote: float = 1.0,
    db: AsyncSession = Depends(get_db_session)
):
    payment_service = PaymentService(db)
    payment = await payment_service.verify_payment(
        reference=reference,
        provider=provider,
        cost_per_vote=cost_per_vote
    )
    await db.commit()
    return {"status": "success", "payment_status": payment.status.value, "amount": float(payment.amount)}

@router.get("/voting/wallet/{election_id}")
async def get_wallet_status(
    election_id: uuid.UUID,
    visitor_session_id: uuid.UUID | None = None,
    current_user: User | None = Depends(get_current_user_optional),
    db: AsyncSession = Depends(get_db_session)
):
    from app.modules.election.services.vote_wallet_service import VoteWalletService
    service = VoteWalletService(db)
    
    user_id = current_user.id if current_user else None
    if not user_id and not visitor_session_id:
        raise HTTPException(status_code=400, detail="Missing user or visitor session identity")
        
    wallet = await service.get_or_create_wallet(
        election_id=election_id,
        user_id=user_id,
        visitor_session_id=visitor_session_id
    )
    
    return {
        "wallet_id": wallet.id,
        "election_id": wallet.election_id,
        "available_votes": wallet.available_votes,
        "reserved_votes": wallet.reserved_votes,
        "used_votes": wallet.used_votes
    }

