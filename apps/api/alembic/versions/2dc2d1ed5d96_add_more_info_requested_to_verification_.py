"""add more_info_requested to verification status enum

Revision ID: 2dc2d1ed5d96
Revises: 616b7b23d308
Create Date: 2026-07-21 17:38:19.276692+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2dc2d1ed5d96'
down_revision: Union[str, Sequence[str], None] = '616b7b23d308'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    with op.get_context().autocommit_block():
        op.execute("ALTER TYPE organization_verification_status_enum ADD VALUE IF NOT EXISTS 'more_info_requested'")

def downgrade() -> None:
    """Downgrade schema."""
    # Postgres doesn't easily support dropping an enum value.
    pass
