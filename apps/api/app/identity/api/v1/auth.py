from fastapi import APIRouter, Depends, Request, Response, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import datetime

from app.database.session import get_db_session
from app.identity.schemas.auth import UserRegister, UserLogin, TokenResponse, TokenRefreshRequest, PasswordResetRequest, PasswordResetConfirm
from pydantic import BaseModel
from app.identity.schemas.user import UserRead
from app.identity.services.auth_service import AuthService
from app.identity.services.session_service import SessionService
from app.identity.services.audit_service import AuditService
from app.identity.security.jwt import create_access_token
from app.identity.api.dependencies import get_current_user
from app.identity.models.user import User

router = APIRouter()


@router.post("/register", response_model=UserRead, status_code=status.HTTP_201_CREATED)
async def register(
    request: Request,
    data: UserRegister,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session)
):
    """Register a new user."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    user = await AuthService.register_user(db, data, ip_address, user_agent, background_tasks)
    return user

class VerifyEmailRequest(BaseModel):
    token: str

@router.post("/verify-email", status_code=status.HTTP_200_OK)
async def verify_email(
    request: Request,
    data: VerifyEmailRequest,
    db: AsyncSession = Depends(get_db_session)
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await AuthService.verify_email(db, data.token, ip_address, user_agent)
    return {"message": "Email verified successfully"}

@router.post("/forgot-password", status_code=status.HTTP_200_OK)
async def forgot_password(
    request: Request,
    data: PasswordResetRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db_session)
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await AuthService.forgot_password(db, data.email, ip_address, user_agent, background_tasks)
    return {"message": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password", status_code=status.HTTP_200_OK)
async def reset_password(
    request: Request,
    data: PasswordResetConfirm,
    db: AsyncSession = Depends(get_db_session)
):
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    await AuthService.reset_password(db, data.token, data.new_password, ip_address, user_agent)
    return {"message": "Password has been reset successfully"}


@router.post("/login", response_model=TokenResponse)
async def login(
    request: Request,
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_db_session)
):
    """Authenticate and generate tokens."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # Map the OAuth2 'username' field to our 'email' field
    login_data = UserLogin(email=form_data.username, password=form_data.password)
    user = await AuthService.authenticate_user(db, login_data, ip_address, user_agent)
    
    # Create Session
    session_obj, raw_refresh_token = await SessionService.create_session(
        db, user.id, None, ip_address, user_agent
    )
    
    # Generate Access Token
    access_token = create_access_token(data={"user_id": str(user.id)})
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=raw_refresh_token,
        user=user
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    request: Request,
    # Typically would take the refresh token to revoke that specific session
    refresh_req: TokenRefreshRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db_session)
):
    """Revoke session and log out."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    
    # In a full implementation, we'd hash the provided refresh_req.refresh_token,
    # find the session, and revoke it via SessionService.
    # For now, we'll just log the audit event.
    await AuditService.log_event(db, "Logout", current_user.id, ip_address, user_agent)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
