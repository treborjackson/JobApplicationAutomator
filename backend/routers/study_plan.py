import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.resume import Resume
from backend.models.study_plan import StudyPlan
from backend.schemas.study_plan import (
    GenerateStudyPlanRequest,
    MarkTopicRequest,
    StudyPlanResponse,
    StudyPlanTemplateResponse,
    StudyTopic,
    StudyWeek,
)
from backend.services.study_plan_service import (
    generate_study_plan,
    flatten_topics,
    compute_progress,
    get_templates,
    _VALID_SENIORITY,
    _VALID_DURATIONS,
)

router = APIRouter(prefix="/study-plan", tags=["study-plan"])


def _to_response(plan: StudyPlan, raw_plan: dict | None = None) -> StudyPlanResponse:
    topics = [StudyTopic(**t) for t in (plan.topics or [])]
    weeks = None
    if raw_plan and raw_plan.get("weeks"):
        weeks = [StudyWeek(**w) for w in raw_plan["weeks"]]

    return StudyPlanResponse(
        id=plan.id,
        user_id=plan.user_id,
        role_title=plan.role_title,
        seniority_level=plan.seniority_level,
        duration_weeks=plan.duration_weeks,
        topics=topics,
        progress_pct=plan.progress_pct,
        generated_at=plan.generated_at.isoformat(),
        last_updated_at=plan.last_updated_at.isoformat(),
        weekly_hours_required=raw_plan.get("weekly_hours_required") if raw_plan else None,
        overview=raw_plan.get("overview") if raw_plan else None,
        weeks=weeks,
        final_project=raw_plan.get("final_project") if raw_plan else None,
        interview_readiness_milestones=raw_plan.get("interview_readiness_milestones") if raw_plan else None,
    )


@router.post("/generate", response_model=StudyPlanResponse, status_code=status.HTTP_201_CREATED)
async def generate(
    body: GenerateStudyPlanRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.seniority_level not in _VALID_SENIORITY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"seniority_level must be one of: {', '.join(_VALID_SENIORITY)}",
        )
    if body.duration_weeks not in _VALID_DURATIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"duration_weeks must be one of: {sorted(_VALID_DURATIONS)}",
        )

    # Use resume skills if current_skills not provided
    current_skills = body.current_skills
    if not current_skills:
        resume_result = await db.execute(select(Resume).where(Resume.user_id == current_user.id))
        resume = resume_result.scalar_one_or_none()
        if resume:
            current_skills = resume.parsed_skills

    try:
        raw_plan = generate_study_plan(
            role_title=body.role_title,
            seniority_level=body.seniority_level,
            duration_weeks=body.duration_weeks,
            current_skills=current_skills,
        )
    except Exception as exc:
        # Fall back to a matching template
        templates = get_templates(body.role_title)
        if templates:
            raw_plan = templates[0]
        else:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Plan generation failed and no template available: {exc}",
            )

    topics = flatten_topics(raw_plan.get("weeks", []))

    plan = StudyPlan(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        role_title=body.role_title,
        seniority_level=body.seniority_level,
        duration_weeks=body.duration_weeks,
        topics=topics,
        progress_pct=0,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return _to_response(plan, raw_plan)


@router.get("/", response_model=StudyPlanResponse)
async def get_active_plan(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudyPlan)
        .where(StudyPlan.user_id == current_user.id)
        .order_by(StudyPlan.generated_at.desc())
    )
    plan = result.scalars().first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No study plan found")
    return _to_response(plan)


@router.put("/{plan_id}/topic/{topic_index}", response_model=StudyPlanResponse)
async def mark_topic(
    plan_id: str,
    topic_index: int,
    body: MarkTopicRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudyPlan).where(
            StudyPlan.id == plan_id,
            StudyPlan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study plan not found")

    topics: list[dict] = list(plan.topics or [])
    if topic_index < 0 or topic_index >= len(topics):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="topic_index out of range")

    topics[topic_index] = {**topics[topic_index], "done": body.done}
    plan.topics = topics
    plan.progress_pct = compute_progress(topics)
    plan.last_updated_at = datetime.utcnow()

    await db.commit()
    await db.refresh(plan)
    return _to_response(plan)


@router.get("/templates", response_model=list[StudyPlanTemplateResponse])
async def list_templates(
    role: str | None = Query(default=None),
    current_user: User = Depends(get_current_user),
):
    templates = get_templates(role)
    return [StudyPlanTemplateResponse(**t) for t in templates]


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(StudyPlan).where(
            StudyPlan.id == plan_id,
            StudyPlan.user_id == current_user.id,
        )
    )
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Study plan not found")

    await db.delete(plan)
    await db.commit()
    return None
