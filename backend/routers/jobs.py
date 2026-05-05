import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.job import JobListing
from backend.models.resume import Resume
from backend.models.saved_job import SavedJob
from backend.schemas.job import JobResponse
from backend.services.job_scraper import search_jobs
from backend.services.matcher import score_job_match

router = APIRouter(prefix="/jobs", tags=["jobs"])


def _model_to_response(job: JobListing, match_score: int | None = None) -> JobResponse:
    return JobResponse(
        id=job.id,
        external_id=job.external_id,
        source=job.source,
        title=job.title,
        company=job.company,
        location=job.location,
        remote_type=job.remote_type,
        salary_min=job.salary_min,
        salary_max=job.salary_max,
        description=job.description,
        url=job.url,
        posted_at=job.posted_at.isoformat() if job.posted_at else None,
        fetched_at=job.fetched_at.isoformat(),
        match_score=match_score,
    )


def _dict_to_model(data: dict) -> JobListing:
    posted_at = None
    if data.get("posted_at"):
        try:
            posted_at = datetime.fromisoformat(data["posted_at"].replace("Z", "+00:00"))
        except Exception:
            pass

    return JobListing(
        id=data["id"],
        external_id=data["external_id"],
        source=data["source"],
        title=data["title"],
        company=data["company"],
        location=data["location"],
        remote_type=data.get("remote_type", "onsite"),
        salary_min=data.get("salary_min"),
        salary_max=data.get("salary_max"),
        description=data["description"],
        url=data["url"],
        posted_at=posted_at,
        fetched_at=datetime.utcnow(),
    )


@router.get("/search", response_model=list[JobResponse])
async def search(
    query: str = Query(..., min_length=1),
    location: str = Query(default=""),
    remote_type: str = Query(default=""),
    salary_min: int | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    raw_jobs = await search_jobs(query, location, remote_type, salary_min, page)

    # Fetch user's resume for match scoring
    resume_result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    resume = resume_result.scalar_one_or_none()
    resume_text = resume.raw_text if resume else ""

    results = []
    for job_data in raw_jobs:
        # Upsert job into DB (cache it)
        existing = await db.execute(
            select(JobListing).where(JobListing.external_id == job_data["external_id"])
        )
        job = existing.scalar_one_or_none()
        if not job:
            job = _dict_to_model(job_data)
            db.add(job)

        match_score = score_job_match(resume_text, job_data["description"]) if resume_text else None
        results.append(_model_to_response(job, match_score))

    await db.commit()
    results.sort(key=lambda j: j.match_score or 0, reverse=True)
    return results


@router.get("/saved", response_model=list[JobResponse])
async def get_saved(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(JobListing)
        .join(SavedJob, SavedJob.job_listing_id == JobListing.id)
        .where(SavedJob.user_id == current_user.id)
    )
    jobs = result.scalars().all()
    return [_model_to_response(j) for j in jobs]


@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(JobListing).where(JobListing.id == job_id))
    job = result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
    return _model_to_response(job)


@router.post("/{job_id}/save", status_code=status.HTTP_201_CREATED)
async def save_job(
    job_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(JobListing).where(JobListing.id == job_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    existing = await db.execute(
        select(SavedJob).where(
            SavedJob.user_id == current_user.id,
            SavedJob.job_listing_id == job_id,
        )
    )
    if existing.scalar_one_or_none():
        return {"detail": "Already saved"}

    saved = SavedJob(id=str(uuid.uuid4()), user_id=current_user.id, job_listing_id=job_id)
    db.add(saved)
    await db.commit()
    return {"detail": "Saved"}
