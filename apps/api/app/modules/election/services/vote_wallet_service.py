import uuid
import datetime
from sqlalchemy import select, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.modules.election.models.payment import VoteWallet, VoteCreditTransaction, VoteCreditTransactionType

class VoteWalletService:
    def __init__(self, db: AsyncSession):
        self.db = db
        
    async def get_or_create_wallet(
        self, 
        election_id: uuid.UUID, 
        user_id: uuid.UUID | None = None, 
        visitor_session_id: uuid.UUID | None = None
    ) -> VoteWallet:
        if not user_id and not visitor_session_id:
            raise ValueError("Either user_id or visitor_session_id must be provided")
            
        stmt = select(VoteWallet).where(VoteWallet.election_id == election_id)
        if user_id:
            stmt = stmt.where(VoteWallet.user_id == user_id)
        if visitor_session_id:
            stmt = stmt.where(VoteWallet.visitor_session_id == visitor_session_id)
            
        result = await self.db.execute(stmt)
        wallet = result.scalar_one_or_none()
        
        if not wallet:
            wallet = VoteWallet(
                election_id=election_id,
                user_id=user_id,
                visitor_session_id=visitor_session_id
            )
            self.db.add(wallet)
            await self.db.flush()
            
        return wallet

    async def allocate_credits(self, wallet_id: uuid.UUID, amount: int, reference_id: uuid.UUID) -> VoteWallet:
        """Called when a payment is verified to add available votes."""
        wallet = await self.db.get(VoteWallet, wallet_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Vote wallet not found")
            
        wallet.available_votes += amount
        
        transaction = VoteCreditTransaction(
            wallet_id=wallet_id,
            transaction_type=VoteCreditTransactionType.PAYMENT,
            amount=amount,
            reference_id=reference_id
        )
        self.db.add(transaction)
        await self.db.flush()
        return wallet

    async def reserve_credits(self, wallet_id: uuid.UUID, amount: int, reference_id: uuid.UUID) -> VoteWallet:
        """Reserve credits before submitting a ballot."""
        wallet = await self.db.get(VoteWallet, wallet_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Vote wallet not found")
            
        if wallet.available_votes < amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient vote credits")
            
        wallet.available_votes -= amount
        wallet.reserved_votes += amount
        
        transaction = VoteCreditTransaction(
            wallet_id=wallet_id,
            transaction_type=VoteCreditTransactionType.RESERVATION,
            amount=amount,
            reference_id=reference_id
        )
        self.db.add(transaction)
        await self.db.flush()
        return wallet

    async def commit_credits(self, wallet_id: uuid.UUID, amount: int, reference_id: uuid.UUID) -> VoteWallet:
        """Commit reserved credits after ballot submission."""
        wallet = await self.db.get(VoteWallet, wallet_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Vote wallet not found")
            
        if wallet.reserved_votes < amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient reserved credits")
            
        wallet.reserved_votes -= amount
        wallet.used_votes += amount
        
        transaction = VoteCreditTransaction(
            wallet_id=wallet_id,
            transaction_type=VoteCreditTransactionType.BALLOT,
            amount=-amount,
            reference_id=reference_id
        )
        self.db.add(transaction)
        await self.db.flush()
        return wallet

    async def release_credits(self, wallet_id: uuid.UUID, amount: int, reference_id: uuid.UUID) -> VoteWallet:
        """Release reserved credits if ballot submission fails or timeouts."""
        wallet = await self.db.get(VoteWallet, wallet_id)
        if not wallet:
            raise HTTPException(status_code=404, detail="Vote wallet not found")
            
        if wallet.reserved_votes < amount:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Insufficient reserved credits to release")
            
        wallet.reserved_votes -= amount
        wallet.available_votes += amount
        
        transaction = VoteCreditTransaction(
            wallet_id=wallet_id,
            transaction_type=VoteCreditTransactionType.RELEASE,
            amount=amount,
            reference_id=reference_id
        )
        self.db.add(transaction)
        await self.db.flush()
        return wallet
