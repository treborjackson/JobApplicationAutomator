import os
import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.config import settings
from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.resume import Resume
from backend.schemas.resume import ResumeResponse
from backend.services.resume_parser import parse_resume

router = APIRouter(prefix="/resume", tags=["resume"])

_ALLOWED_TYPES = {"application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"}
_ALLOWED_EXTENSIONS = {".pdf", ".docx"}


def _to_response(r: Resume) -> ResumeResponse:
    return ResumeResponse(
        id=r.id,
        user_id=r.user_id,
        filename=r.filename,
        file_path=r.file_path,
        raw_text=r.raw_text,
        parsed_skills=r.parsed_skills,
        parsed_experience=r.parsed_experience,
        parsed_education=r.parsed_education,
        parsed_achievements=r.parsed_achievements,
        uploaded_at=r.uploaded_at.isoformat(),
        updated_at=r.updated_at.isoformat(),
    )


async def _save_file(file: UploadFile) -> tuple[bytes, str]:
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only PDF and DOCX files are allowed")

    content = await file.read()
    if len(content) > settings.max_upload_size_bytes:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="File exceeds 5MB limit")

    upload_dir = Path(settings.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)

    dest_filename = f"{uuid.uuid4()}{suffix}"
    dest_path = upload_dir / dest_filename
    dest_path.write_bytes(content)

    return content, str(dest_path)


@router.post("/upload", response_model=ResumeResponse, status_code=status.HTTP_201_CREATED)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Replace existing resume if one already exists
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    existing = result.scalar_one_or_none()
    if existing:
        try:
            os.remove(existing.file_path)
        except FileNotFoundError:
            pass
        await db.delete(existing)
        await db.flush()

    content, file_path = await _save_file(file)

    try:
        parsed = parse_resume(content, file.filename or "resume")
    except Exception:
        parsed = {
            "raw_text": content.decode("utf-8", errors="ignore"),
            "parsed_skills": [],
            "parsed_experience": [],
            "parsed_education": [],
            "parsed_achievements": [],
        }

    resume = Resume(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        filename=file.filename or "resume",
        file_path=file_path,
        **parsed,
    )
    db.add(resume)
    await db.commit()
    await db.refresh(resume)
    return _to_response(resume)


@router.get("/", response_model=ResumeResponse)
async def get_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found")
    return _to_response(resume)


@router.put("/", response_model=ResumeResponse)
async def update_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found — use POST /resume/upload first")

    try:
        os.remove(resume.file_path)
    except FileNotFoundError:
        pass

    content, file_path = await _save_file(file)

    try:
        parsed = parse_resume(content, file.filename or "resume")
    except Exception:
        parsed = {
            "raw_text": content.decode("utf-8", errors="ignore"),
            "parsed_skills": [],
            "parsed_experience": [],
            "parsed_education": [],
            "parsed_achievements": [],
        }

    resume.filename = file.filename or "resume"
    resume.file_path = file_path
    resume.raw_text = parsed["raw_text"]
    resume.parsed_skills = parsed["parsed_skills"]
    resume.parsed_experience = parsed["parsed_experience"]
    resume.parsed_education = parsed["parsed_education"]
    resume.parsed_achievements = parsed["parsed_achievements"]

    await db.commit()
    await db.refresh(resume)
    return _to_response(resume)


@router.delete("/", status_code=status.HTTP_204_NO_CONTENT)
async def delete_resume(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
    resume = result.scalar_one_or_none()
    if not resume:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No resume found")

    try:
        os.remove(resume.file_path)
    except FileNotFoundError:
        pass

    await db.delete(resume)
    await db.commit()
    return None
