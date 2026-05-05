from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.application import Application
from backend.models.job import JobListing
from backend.schemas.application import DashboardStats, ApplicationResponse, ApplicationJobSummary

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
async def get_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application.status, func.count(Application.id))
        .where(Application.user_id == current_user.id)
        .group_by(Application.status)
    )
    counts: dict[str, int] = {row[0]: row[1] for row in result.all()}

    total = sum(counts.values())
    interviews = counts.get("interview", 0)
    offers = counts.get("offer", 0)
    rejected = counts.get("rejected", 0)
    rejection_rate = round((rejected / total) * 100, 1) if total > 0 else 0.0

    return DashboardStats(
        total_applied=total,
        interviews=interviews,
        offers=offers,
        rejection_rate=rejection_rate,
    )


@router.get("/recent", response_model=list[ApplicationResponse])
async def get_recent(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application, JobListing)
        .join(JobListing, Application.job_listing_id == JobListing.id, isouter=True)
        .where(Application.user_id == current_user.id)
        .order_by(Application.submitted_at.desc())
        .limit(10)
    )
    rows = result.all()

    responses = []
    for app, job in rows:
        job_summary = None
        if job:
            job_summary = ApplicationJobSummary(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                url=job.url,
            )
        responses.append(ApplicationResponse(
            id=app.id,
            user_id=app.user_id,
            job_listing_id=app.job_listing_id,
            cover_letter_id=app.cover_letter_id,
            status=app.status,
            submission_method=app.submission_method,
            submitted_at=app.submitted_at.isoformat(),
            last_updated_at=app.last_updated_at.isoformat(),
            notes=app.notes,
            job=job_summary,
        ))
    return responses
