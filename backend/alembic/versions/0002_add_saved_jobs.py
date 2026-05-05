"""add saved_jobs table

Revision ID: 0002
Revises: 0001
Create Date: 2026-05-05 00:01:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "saved_jobs",
        sa.Column("id", sa.String(), nullable=False),
        sa.Column("user_id", sa.String(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("job_listing_id", sa.String(), sa.ForeignKey("job_listings.id"), nullable=False),
        sa.Column("saved_at", sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("user_id", "job_listing_id"),
    )
    op.create_index("ix_saved_jobs_user_id", "saved_jobs", ["user_id"])


def downgrade() -> None:
    op.drop_table("saved_jobs")
