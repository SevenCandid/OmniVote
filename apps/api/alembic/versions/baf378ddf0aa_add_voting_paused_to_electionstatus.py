"""add voting_paused to electionstatus

Revision ID: baf378ddf0aa
Revises: 609325742bca
Create Date: 2026-07-22 18:44:21.051304+00:00

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'baf378ddf0aa'
down_revision: Union[str, Sequence[str], None] = '609325742bca'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE electionstatus ADD VALUE IF NOT EXISTS 'VOTING_PAUSED'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
