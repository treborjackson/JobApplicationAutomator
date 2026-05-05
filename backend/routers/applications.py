import csv
import io
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.job import JobListing
from backend.models.application import Application
from backend.schemas.application import (
    SubmitApplicationRequest,
    UpdateStatusRequest,
    ApplicationResponse,
    ApplicationJobSummary,
)

router = APIRouter(prefix="/applications", tags=["applications"])

_VALID_STATUSES = {"pending", "interview", "rejected", "offer", "withdrawn"}


async def _load_application(
    app_id: str, user_id: str, db: AsyncSession
) -> Application:
    result = await db.execute(
        select(Application).where(
            Application.id == app_id,
            Application.user_id == user_id,
        )
    )
    app = result.scalar_one_or_none()
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    return app


async def _to_response(app: Application, db: AsyncSession) -> ApplicationResponse:
    job_summary = None
    if app.job_listing_id:
        result = await db.execute(select(JobListing).where(JobListing.id == app.job_listing_id))
        job = result.scalar_one_or_none()
        if job:
            job_summary = ApplicationJobSummary(
                id=job.id,
                title=job.title,
                company=job.company,
                location=job.location,
                url=job.url,
            )
    return ApplicationResponse(
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
    )


@router.post("/submit", response_model=ApplicationResponse, status_code=status.HTTP_201_CREATED)
async def submit_application(
    body: SubmitApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job_result = await db.execute(select(JobListing).where(JobListing.id == body.job_listing_id))
    if not job_result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    if body.submission_method not in {"auto", "manual", "package"}:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid submission_method")

    app = Application(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        job_listing_id=body.job_listing_id,
        cover_letter_id=body.cover_letter_id,
        status="pending",
        submission_method=body.submission_method,
        notes=body.notes,
    )
    db.add(app)
    await db.commit()
    await db.refresh(app)
    return await _to_response(app, db)


@router.get("/", response_model=list[ApplicationResponse])
async def list_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application)
        .where(Application.user_id == current_user.id)
        .order_by(Application.submitted_at.desc())
    )
    apps = result.scalars().all()
    return [await _to_response(a, db) for a in apps]


@router.get("/export")
async def export_applications(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Application, JobListing)
        .join(JobListing, Application.job_listing_id == JobListing.id, isouter=True)
        .where(Application.user_id == current_user.id)
        .order_by(Application.submitted_at.desc())
    )
    rows = result.all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Job Title", "Company", "Location", "Status", "Method", "Submitted", "Notes", "URL"])
    for app, job in rows:
        writer.writerow([
            job.title if job else "",
            job.company if job else "",
            job.location if job else "",
            app.status,
            app.submission_method,
            app.submitted_at.isoformat(),
            app.notes or "",
            job.url if job else "",
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=applications.csv"},
    )


@router.get("/{app_id}", response_model=ApplicationResponse)
async def get_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    app = await _load_application(app_id, current_user.id, db)
    return await _to_response(app, db)


@router.put("/{app_id}/status", response_model=ApplicationResponse)
async def update_status(
    app_id: str,
    body: UpdateStatusRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.status not in _VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {', '.join(_VALID_STATUSES)}",
        )
    app = await _load_application(app_id, current_user.id, db)
    app.status = body.status
    await db.commit()
    await db.refresh(app)
    return await _to_response(app, db)


@router.delete("/{app_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_application(
    app_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    app = await _load_application(app_id, current_user.id, db)
    await db.delete(app)
    await db.commit()
    return None
