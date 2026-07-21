from fastapi import APIRouter

from app.api.v1.endpoints import health, organizations
from app.identity.api.v1 import auth as identity_auth
from app.identity.api.v1 import users as identity_users
from app.identity.api.v1 import sessions as identity_sessions

from app.modules.membership.routes import (
    memberships as membership_routes,
    organizations as membership_org_routes,
    users as membership_user_routes,
    invitations as membership_invitations_routes,
)
from app.modules.rbac.routes import (
    permissions as rbac_permissions_routes,
    roles as rbac_roles_routes,
    memberships as rbac_memberships_routes,
    platform as rbac_platform_routes,
)
from app.modules.support.routes import support as support_routes

api_router = APIRouter()

# Register endpoint routers
api_router.include_router(health.router, tags=["Health"])
api_router.include_router(organizations.router, prefix="/organizations", tags=["Organizations"])

# Identity Platform
api_router.include_router(identity_auth.router, prefix="/identity/auth", tags=["Identity - Auth"])
api_router.include_router(identity_users.router, prefix="/identity/users", tags=["Identity - Users"])
api_router.include_router(identity_sessions.router, prefix="/identity/sessions", tags=["Identity - Sessions"])

from app.api.v1.endpoints import platform_organizations
from app.api.v1.endpoints import platform_identity

from app.api.v1.endpoints import platform_dashboard

# Platform Identity & Administration
api_router.include_router(rbac_platform_routes.router, prefix="/platform", tags=["Platform"])
api_router.include_router(platform_identity.router, prefix="/platform", tags=["Platform - Identity"])
api_router.include_router(platform_organizations.router, prefix="/platform/organizations", tags=["Platform - Organizations"])
api_router.include_router(platform_dashboard.router, prefix="/platform/dashboard", tags=["Platform - Dashboard"])

# Membership API
api_router.include_router(membership_routes.router, prefix="/memberships", tags=["Memberships"])
api_router.include_router(membership_org_routes.router, prefix="/organizations", tags=["Organizations (Membership)"])
api_router.include_router(membership_user_routes.router, prefix="/users", tags=["Users (Membership)"])
api_router.include_router(membership_invitations_routes.router, prefix="/invitations", tags=["Invitations"])

# RBAC API
api_router.include_router(rbac_permissions_routes.router, prefix="/permissions", tags=["Permissions"])
api_router.include_router(rbac_roles_routes.router, prefix="/organizations/{organization_id}/roles", tags=["Roles"])
api_router.include_router(rbac_memberships_routes.router, prefix="/organizations/{organization_id}/memberships", tags=["Membership Roles"])

# Support API
api_router.include_router(support_routes.router, tags=["Support"])

