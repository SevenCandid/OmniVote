import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import async_session_factory
from app.modules.rbac.models.rbac import PlatformRole, PlatformPermission, PlatformRolePermission

async def run():
    async with async_session_factory() as db:
        # Get Platform Administrator role
        res = await db.execute(select(PlatformRole).where(PlatformRole.name == "Platform Administrator"))
        role = res.scalar_one_or_none()
        
        # Get user.manage permission
        res = await db.execute(select(PlatformPermission).where(PlatformPermission.key == "user.manage"))
        perm = res.scalar_one_or_none()
        
        if role and perm:
            # Delete mapping
            res = await db.execute(
                select(PlatformRolePermission)
                .where(PlatformRolePermission.role_id == role.id, PlatformRolePermission.permission_id == perm.id)
            )
            rp = res.scalar_one_or_none()
            if rp:
                await db.delete(rp)
                await db.commit()
                print("Successfully removed user.manage from Platform Administrator")
            else:
                print("Mapping not found")
        else:
            print("Role or Permission not found")

if __name__ == "__main__":
    asyncio.run(run())
