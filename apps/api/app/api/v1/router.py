from fastapi import APIRouter

from app.api.v1.endpoints import health, organizations
from app.identity.api.v1 import auth as identity_auth
from app.identity.api.v1 import users as identity_users
from app.identity.api.v1 import sessions as identity_sessions

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])

# Identity Platform
api_router.include_router(identity_auth.router, prefix="/identity/auth", tags=["Identity - Auth"])
api_router.include_router(identity_users.router, prefix="/identity/users", tags=["Identity - Users"])
api_router.include_router(identity_sessions.router, prefix="/identity/sessions", tags=["Identity - Sessions"])

