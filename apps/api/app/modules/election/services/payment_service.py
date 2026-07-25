import uuid
import datetime
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.modules.election.models.payment import Payment, PaymentStatus
from app.modules.election.services.vote_wallet_service import VoteWalletService

class PaymentService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.wallet_service = VoteWalletService(db)

    async def initiate_payment(
        self,
        election_id: uuid.UUID,
        amount: float,
        currency: str,
        provider: str,
        user_id: uuid.UUID | None = None,
        visitor_session_id: uuid.UUID | None = None,
    ) -> Payment:
        # Generate a unique reference for the payment provider
        reference = f"VOTE-{uuid.uuid4().hex[:12].upper()}"
        
        payment = Payment(
            election_id=election_id,
            user_id=user_id,
            visitor_session_id=visitor_session_id,
            provider=provider,
            reference=reference,
            amount=amount,
            currency=currency,
            status=PaymentStatus.PENDING
        )
        self.db.add(payment)
        await self.db.flush()
        
        return payment

    async def verify_payment(self, reference: str, provider: str, cost_per_vote: float) -> Payment:
        """
        Verify payment via webhook or direct API call.
        Includes idempotency protection.
        """
        stmt = select(Payment).where(Payment.reference == reference)
        result = await self.db.execute(stmt)
        payment = result.scalar_one_or_none()
        
        if not payment:
            raise HTTPException(status_code=404, detail="Payment not found")
            
        if payment.status == PaymentStatus.SUCCESS:
            # Idempotency: return if already processed successfully
            return payment
            
        # In a real app, here we would verify with Stripe/Paystack API:
        # provider_status = await provider_api.verify(reference)
        # For this implementation, we assume successful verification if called
        payment.status = PaymentStatus.SUCCESS
        payment.verified_at = datetime.datetime.utcnow()
        
        # Calculate vote credits
        votes_allocated = int(payment.amount / cost_per_vote)
        if votes_allocated > 0:
            wallet = await self.wallet_service.get_or_create_wallet(
                election_id=payment.election_id,
                user_id=payment.user_id,
                visitor_session_id=payment.visitor_session_id
            )
            await self.wallet_service.allocate_credits(
                wallet_id=wallet.id,
                amount=votes_allocated,
                reference_id=payment.id
            )
            
        await self.db.flush()
        return payment
