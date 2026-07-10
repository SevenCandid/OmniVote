"""initial_schema

Revision ID: b06526941208
Revises:
Create Date: 2026-07-09 12:43:37.328364+00:00

"""

from collections.abc import Sequence

# revision identifiers, used by Alembic.
revision: str = "b06526941208"
down_revision: str | Sequence[str] | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
