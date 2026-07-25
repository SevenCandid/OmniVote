import enum
import uuid
import datetime
from sqlalchemy import String, ForeignKey, Enum, Boolean, Integer, Numeric, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import BaseModel
from app.database.mixins import TimestampMixin
from app.database.types import UTCDateTime

class PaymentStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    SUCCESS = "success"
    FAILED = "failed"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"

class Payment(BaseModel, TimestampMixin):
    __tablename__ = "payments"
    
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    # Optional registered user id, or visitor session id
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    visitor_session_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitor_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    provider: Mapped[str] = mapped_column(String(50), nullable=False)
    reference: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    
    amount: Mapped[float] = mapped_column(Numeric(10, 2), nullable=False)
    currency: Mapped[str] = mapped_column(String(10), nullable=False)
    
    status: Mapped[PaymentStatus] = mapped_column(Enum(PaymentStatus), nullable=False, default=PaymentStatus.PENDING, index=True)
    
    verified_at: Mapped[datetime.datetime | None] = mapped_column(UTCDateTime, nullable=True)

    # Relationships
    election = relationship("Election")


class VoteWallet(BaseModel, TimestampMixin):
    __tablename__ = "vote_wallets"
    
    election_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("elections.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("identity_users.id", ondelete="SET NULL"), nullable=True, index=True
    )
    visitor_session_id: Mapped[uuid.UUID | None] = mapped_column(
        ForeignKey("visitor_sessions.id", ondelete="SET NULL"), nullable=True, index=True
    )
    
    available_votes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    reserved_votes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    used_votes: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    election = relationship("Election")
    transactions = relationship("VoteCreditTransaction", back_populates="wallet", cascade="all, delete-orphan")


class VoteCreditTransactionType(str, enum.Enum):
    PAYMENT = "payment"
    BALLOT = "ballot"
    REFUND = "refund"
    RESERVATION = "reservation"
    RELEASE = "release"

class VoteCreditTransaction(BaseModel):
    __tablename__ = "vote_credit_transactions"
    
    wallet_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("vote_wallets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    
    transaction_type: Mapped[VoteCreditTransactionType] = mapped_column(Enum(VoteCreditTransactionType), nullable=False)
    
    amount: Mapped[int] = mapped_column(Integer, nullable=False)
    
    # Can be a payment id or ballot id depending on transaction type
    reference_id: Mapped[uuid.UUID | None] = mapped_column(nullable=True, index=True)
    
    created_at: Mapped[datetime.datetime] = mapped_column(UTCDateTime, default=datetime.datetime.utcnow, nullable=False)
    
    # Relationships
    wallet = relationship("VoteWallet", back_populates="transactions")
