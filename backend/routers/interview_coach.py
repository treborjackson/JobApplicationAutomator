import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.database import get_db
from backend.middleware.auth import get_current_user
from backend.models.user import User
from backend.models.interview_session import InterviewSession
from backend.schemas.interview import (
    StartSessionRequest,
    SubmitAnswerRequest,
    GetTipsRequest,
    InterviewMessage,
    AnswerFeedbackResponse,
    InterviewSessionResponse,
    InterviewTipsResponse,
    QuestionBankItem,
)
from backend.services.interview_service import (
    start_session,
    evaluate_answer,
    generate_tips,
    generate_question_bank,
    generate_overall_summary,
    _VALID_TYPES,
)

router = APIRouter(prefix="/interview", tags=["interview"])


def _to_response(session: InterviewSession) -> InterviewSessionResponse:
    return InterviewSessionResponse(
        id=session.id,
        user_id=session.user_id,
        job_listing_id=session.job_listing_id,
        role_title=session.role_title,
        interview_type=session.interview_type,
        messages=[InterviewMessage(**m) for m in (session.messages or [])],
        overall_score=session.overall_score,
        tips_generated=session.tips_generated,
        created_at=session.created_at.isoformat(),
        completed_at=session.completed_at.isoformat() if session.completed_at else None,
    )


@router.post("/session/start", response_model=InterviewSessionResponse, status_code=status.HTTP_201_CREATED)
async def start_interview_session(
    body: StartSessionRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if body.interview_type not in _VALID_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"interview_type must be one of: {', '.join(_VALID_TYPES)}",
        )

    try:
        opening = start_session(body.role_title, body.interview_type)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    messages = [{"role": "assistant", "content": opening}]

    session = InterviewSession(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        job_listing_id=body.job_id,
        role_title=body.role_title,
        interview_type=body.interview_type,
        messages=messages,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return _to_response(session)


@router.post("/session/{session_id}/answer", response_model=AnswerFeedbackResponse)
async def submit_answer(
    session_id: str,
    body: SubmitAnswerRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    if session.completed_at:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session already completed")

    messages: list[dict] = list(session.messages or [])

    # Last assistant message is the question
    assistant_msgs = [m for m in messages if m["role"] == "assistant"]
    if not assistant_msgs:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No question found in session")
    last_question = assistant_msgs[-1]["content"]

    # Build conversation history for Claude (alternate user/assistant)
    claude_conversation = [
        {"role": m["role"], "content": m["content"]}
        for m in messages
        if m["role"] in {"user", "assistant"}
    ]

    try:
        feedback = evaluate_answer(
            role_title=session.role_title,
            interview_type=session.interview_type,
            conversation=claude_conversation,
            last_question=last_question,
            user_answer=body.answer,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))

    # Append user answer with feedback metadata
    messages.append({
        "role": "user",
        "content": body.answer,
        "feedback": feedback.get("feedback"),
        "score": feedback.get("score"),
    })
    # Append next question as assistant message
    messages.append({
        "role": "assistant",
        "content": feedback.get("next_question", ""),
    })

    session.messages = messages
    await db.commit()

    return AnswerFeedbackResponse(
        score=feedback.get("score", 0),
        feedback=feedback.get("feedback", ""),
        improvement=feedback.get("improvement", ""),
        model_answer_hint=feedback.get("model_answer_hint", ""),
        next_question=feedback.get("next_question", ""),
    )


@router.post("/session/{session_id}/complete", response_model=InterviewSessionResponse)
async def complete_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")

    try:
        overall_score, tips = generate_overall_summary(
            session.role_title, session.interview_type, session.messages or []
        )
    except Exception:
        overall_score, tips = 0, {}

    session.overall_score = overall_score
    session.tips_generated = tips
    session.completed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)
    return _to_response(session)


@router.get("/session/{session_id}", response_model=InterviewSessionResponse)
async def get_session(
    session_id: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InterviewSession).where(
            InterviewSession.id == session_id,
            InterviewSession.user_id == current_user.id,
        )
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Session not found")
    return _to_response(session)


@router.get("/sessions", response_model=list[InterviewSessionResponse])
async def list_sessions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(InterviewSession)
        .where(InterviewSession.user_id == current_user.id)
        .order_by(InterviewSession.created_at.desc())
    )
    return [_to_response(s) for s in result.scalars().all()]


@router.post("/tips", response_model=InterviewTipsResponse)
async def get_tips(
    body: GetTipsRequest,
    current_user: User = Depends(get_current_user),
):
    if body.interview_type not in _VALID_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"interview_type must be one of: {', '.join(_VALID_TYPES)}",
        )
    try:
        tips = generate_tips(body.role_title, body.interview_type)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    return InterviewTipsResponse(**tips)


@router.get("/questions/bank", response_model=list[QuestionBankItem])
async def get_question_bank(
    role: str = Query(...),
    type: str = Query(...),
    difficulty: str = Query(default="medium"),
    current_user: User = Depends(get_current_user),
):
    if type not in _VALID_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"type must be one of: {', '.join(_VALID_TYPES)}",
        )
    try:
        questions = generate_question_bank(role, type, difficulty)
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(exc))
    return [QuestionBankItem(**q) for q in questions]
