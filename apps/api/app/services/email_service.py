from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

def get_mail_config() -> ConnectionConfig:
    return ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER or "",
        MAIL_PASSWORD=settings.SMTP_PASSWORD or "",
        MAIL_FROM=settings.EMAILS_FROM_EMAIL or "noreply@veroseven.com",
        MAIL_PORT=settings.SMTP_PORT or 587,
        MAIL_SERVER=settings.SMTP_HOST or "localhost",
        MAIL_FROM_NAME=settings.EMAILS_FROM_NAME or "VeroSeven Identity Platform",
        MAIL_STARTTLS=getattr(settings, "SMTP_TLS", False),
        MAIL_SSL_TLS=getattr(settings, "SMTP_SSL", False),
        USE_CREDENTIALS=bool(settings.SMTP_USER),
        VALIDATE_CERTS=True,
    )

class EmailService:
    @staticmethod
    async def send_verification_email(email_to: EmailStr, token: str):
        if not settings.SMTP_HOST:
            logger.warning(f"SMTP not configured. Would send verification to {email_to} with token: {token}")
            return

        conf = get_mail_config()
        # Ensure mail config is valid before attempting
        if not conf.USE_CREDENTIALS and conf.MAIL_SERVER not in ["localhost", "omnivote-mail"]:
            logger.warning(f"Simulating verification to {email_to} with token {token} because no SMTP credentials.")
            return
             
        # Verification link assumes frontend runs on VITE_API_BASE_URL parent, e.g. localhost:5173
        verify_link = f"http://localhost:5173/auth/verify-email?token={token}"

        html = f"""
        <p>Hello,</p>
        <p>Please verify your email address by clicking the link below:</p>
        <a href="{verify_link}">{verify_link}</a>
        <p>If you did not request this, you can ignore this email.</p>
        """

        message = MessageSchema(
            subject="Verify your email address",
            recipients=[email_to],
            body=html,
            subtype=MessageType.html
        )

        try:
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Sent verification email to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send email to {email_to}: {e}")

    @staticmethod
    async def send_password_reset_email(email_to: EmailStr, token: str):
        if not settings.SMTP_HOST:
            logger.warning(f"SMTP not configured. Would send reset to {email_to} with token: {token}")
            return

        conf = get_mail_config()
        if not conf.USE_CREDENTIALS and conf.MAIL_SERVER not in ["localhost", "omnivote-mail"]:
            logger.warning(f"Simulating reset to {email_to} with token {token} because no SMTP credentials.")
            return
             
        # Reset link
        reset_link = f"http://localhost:5173/auth/reset-password?token={token}"

        html = f"""
        <p>Hello,</p>
        <p>You requested a password reset. Please click the link below to set a new password:</p>
        <a href="{reset_link}">{reset_link}</a>
        <p>If you did not request this, you can ignore this email.</p>
        """

        message = MessageSchema(
            subject="Reset your password",
            recipients=[email_to],
            body=html,
            subtype=MessageType.html
        )

        try:
            fm = FastMail(conf)
            await fm.send_message(message)
            logger.info(f"Sent password reset email to {email_to}")
        except Exception as e:
            logger.error(f"Failed to send reset email to {email_to}: {e}")
