from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status
import datetime

from app.identity.models.user import User, AccountStatus
from app.identity.models.credential import Credential
from app.identity.schemas.auth import UserRegister, UserLogin
from app.identity.security.password import get_password_hash, verify_password
from app.identity.services.audit_service import AuditService
from app.identity.models.tokens import VerificationToken, PasswordResetToken
from app.services.email_service import EmailService
import secrets
import hashlib


class AuthService:
    @staticmethod
    async def register_user(db: AsyncSession, data: UserRegister, ip_address: str | None = None, user_agent: str | None = None, background_tasks = None) -> User:
        """Register a new user."""
        # Check duplicate email
        stmt = select(User).where(User.email == data.email)
        result = await db.execute(stmt)
        if result.scalar_one_or_none():
            # Standard practice: don't reveal if email is taken during generic errors, 
            # but since registration requires a clear error, we return 409
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email is already registered"
            )

        # Create user
        user = User(
            email=data.email,
            first_name=data.first_name,
            last_name=data.last_name,
            status=AccountStatus.PENDING_VERIFICATION
        )
        db.add(user)
        await db.flush() # flush to get user.id

        # Create credential
        credential = Credential(
            user_id=user.id,
            password_hash=get_password_hash(data.password)
        )
        db.add(credential)

        # Audit event
        await AuditService.log_event(
            db=db,
            event_type="Registration",
            user_id=user.id,
            ip_address=ip_address,
            user_agent=user_agent
        )

        # Generate Verification Token
        raw_token = secrets.token_urlsafe(32)
        hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
        
        verification_token = VerificationToken(
            user_id=user.id,
            token=hashed_token,
            expires_at=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=24)
        )
        db.add(verification_token)

        await db.commit()
        await db.refresh(user)
        
        # Send email in background with raw token
        if background_tasks:
            background_tasks.add_task(EmailService.send_verification_email, user.email, raw_token)
        
        return user

    @staticmethod
    async def authenticate_user(db: AsyncSession, data: UserLogin, ip_address: str | None = None, user_agent: str | None = None) -> User:
        """Authenticate user and return the User object."""
        stmt = select(User).where(User.email == data.email, User.is_deleted == False)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        # Generic error message to prevent email enumeration
        auth_exc = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

        if not user:
            await AuditService.log_event(db, "Login Failure", None, ip_address, user_agent, {"email": data.email, "reason": "user_not_found"})
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="We couldn't find an account associated with this email address."
            )

        if user.status in [AccountStatus.SUSPENDED, AccountStatus.DISABLED]:
            await AuditService.log_event(db, "Login Failure", user.id, ip_address, user_agent, {"reason": f"account_{user.status.value.lower()}"})
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is suspended or disabled"
            )

        stmt_cred = select(Credential).where(Credential.user_id == user.id)
        result_cred = await db.execute(stmt_cred)
        credential = result_cred.scalar_one_or_none()

        if not credential or not verify_password(data.password, credential.password_hash):
            if credential:
                credential.failed_login_attempts += 1
                await db.commit()
            await AuditService.log_event(db, "Login Failure", user.id, ip_address, user_agent, {"reason": "invalid_password"})
            raise auth_exc

        # Reset failed attempts on success
        if credential.failed_login_attempts > 0:
            credential.failed_login_attempts = 0

        user.last_login_at = datetime.datetime.now(datetime.timezone.utc)
        
        await AuditService.log_event(db, "Login Success", user.id, ip_address, user_agent)
        await db.commit()
        await db.refresh(user)
        
        return user

    @staticmethod
    async def verify_email(db: AsyncSession, token: str, ip_address: str | None = None, user_agent: str | None = None):
        hashed_token = hashlib.sha256(token.encode()).hexdigest()
        stmt = select(VerificationToken).where(VerificationToken.token == hashed_token)
        result = await db.execute(stmt)
        db_token = result.scalar_one_or_none()

        if not db_token or db_token.expires_at < datetime.datetime.now(datetime.timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

        stmt_user = select(User).where(User.id == db_token.user_id)
        result_user = await db.execute(stmt_user)
        user = result_user.scalar_one()

        if user.status != AccountStatus.ACTIVE:
            user.status = AccountStatus.ACTIVE
            
        await AuditService.log_event(db, "Email Verified", user.id, ip_address, user_agent)
        
        await db.delete(db_token)
        await db.commit()

    @staticmethod
    async def forgot_password(db: AsyncSession, email: str, ip_address: str | None = None, user_agent: str | None = None, background_tasks = None):
        stmt = select(User).where(User.email == email, User.is_deleted == False)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()

        # Return explicit error if user is not found, as requested
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="We couldn't find an account associated with this email address."
            )
            
        raw_token = secrets.token_urlsafe(32)
        hashed_token = hashlib.sha256(raw_token.encode()).hexdigest()
        
        reset_token = PasswordResetToken(
            user_id=user.id,
            token=hashed_token,
            expires_at=datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(hours=1)
        )
        db.add(reset_token)
        await AuditService.log_event(db, "Password Reset Requested", user.id, ip_address, user_agent)
        await db.commit()

        if background_tasks:
            background_tasks.add_task(EmailService.send_password_reset_email, user.email, raw_token)

    @staticmethod
    async def reset_password(db: AsyncSession, token: str, new_password: str, ip_address: str | None = None, user_agent: str | None = None):
        hashed_token = hashlib.sha256(token.encode()).hexdigest()
        stmt = select(PasswordResetToken).where(PasswordResetToken.token == hashed_token)
        result = await db.execute(stmt)
        db_token = result.scalar_one_or_none()

        if not db_token or db_token.expires_at < datetime.datetime.now(datetime.timezone.utc):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired token")

        stmt_cred = select(Credential).where(Credential.user_id == db_token.user_id)
        result_cred = await db.execute(stmt_cred)
        credential = result_cred.scalar_one()

        credential.password_hash = get_password_hash(new_password)
        credential.failed_login_attempts = 0
        
        await AuditService.log_event(db, "Password Reset Completed", db_token.user_id, ip_address, user_agent)
        
        await db.delete(db_token)
        await db.commit()
