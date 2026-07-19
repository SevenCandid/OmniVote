import asyncio
import uuid
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import engine
from app.services.organization_service import OrganizationService
from app.schemas.organization import OrganizationCreate
from sqlalchemy import text
import traceback

async def main():
    async with AsyncSession(engine) as session:
        try:
            # find first user
            res = await session.execute(text("SELECT id FROM identity_users LIMIT 1"))
            user_id = res.scalar()
            
            if not user_id:
                print("No user found")
                return

            service = OrganizationService(session)
            org_data = OrganizationCreate(
                name="Test Org",
                slug="test-org-123",
                legal_name=None,
                description=None,
                website=None,
                contact_email="test@test.com",
                contact_phone=None,
                country=None
            )
            org = await service.create_organization(org_data, uuid.UUID(str(user_id)))
            print("Org created:", org.id)
            
        except Exception as e:
            traceback.print_exc()

asyncio.run(main())
