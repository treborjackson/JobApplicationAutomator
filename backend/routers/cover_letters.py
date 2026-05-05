import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.job import JobListing
from backend.models.resume import Resume
from backend.models.cover_letter import CoverLetter
from backend.schemas.cover_letter import (
    GenerateCoverLetterRequest,
    UpdateCoverLetterRequest,
    CoverLetterResponse,
)
from backend.services.llm_service import generate_cover_letter

router = APIRouter(prefix="/cover-letters", tags=["cover-letters"])


def _to_response(cl: CoverLetter) -> CoverLetterResponse:
    return CoverLetterResponse(
        id=cl.id,
        user_id=cl.user_id,
        job_listing_id=cl.job_listing_id,
        content=cl.content,
        generated_at=cl.generated_at.isoformat(),
        edited_at=cl.edited_at.isoformat() if cl.edited_at else None,
    )


@router.post("/generate", response_model=CoverLetterResponse, status_code=status.HTTP_201_CREATED)
async def generate(
    body: GenerateCoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    job_result = await db.execute(select(JobListing).where(JobListing.id == body.job_listing_id))
    job = job_result.scalar_one_or_none()
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")

    resume_result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    resume = resume_result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Upload a resume before generating a cover letter")

    try:
        content = generate_cover_letter(
            resume_data={
                "parsed_skills": resume.parsed_skills,
                "parsed_experience": resume.parsed_experience,
                "parsed_achievements": resume.parsed_achievements,
            },
            job_title=job.title,
            company=job.company,
            job_description=job.description,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Cover letter generation failed: {exc}",
        )

    cover_letter = CoverLetter(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        job_listing_id=job.id,
        content=content,
    )
    db.add(cover_letter)
    await db.commit()
    await db.refresh(cover_letter)
    return _to_response(cover_letter)


@router.get("/{cover_letter_id}", response_model=CoverLetterResponse)
async def get_cover_letter(
    cover_letter_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
    )
    cl = result.scalar_one_or_none()
    if not cl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found")
    return _to_response(cl)


@router.put("/{cover_letter_id}", response_model=CoverLetterResponse)
async def update_cover_letter(
    cover_letter_id: str,
    body: UpdateCoverLetterRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CoverLetter).where(
            CoverLetter.id == cover_letter_id,
            CoverLetter.user_id == current_user.id,
        )
    )
    cl = result.scalar_one_or_none()
    if not cl:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cover letter not found")

    cl.content = body.content
    cl.edited_at = datetime.utcnow()
    await db.commit()
    await db.refresh(cl)
    return _to_response(cl)
