import pytest
from unittest.mock import AsyncMock

@pytest.mark.asyncio
async def test_authorization_service_init():
    from app.modules.rbac.services.authorization_service import AuthorizationService
    mock_db = AsyncMock()
    service = AuthorizationService(mock_db)
    assert service.db == mock_db
    
@pytest.mark.asyncio
async def test_rbac_schemas():
    from app.modules.rbac.schemas.rbac import RoleCreate
    role = RoleCreate(name="Admin", description="test")
    assert role.name == "Admin"
