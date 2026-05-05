from pydantic import BaseModel


class StartSessionRequest(BaseModel):
    role_title: str
    interview_type: str
    job_id: str | None = None


class SubmitAnswerRequest(BaseModel):
    answer: str


class GetTipsRequest(BaseModel):
    role_title: str
    interview_type: str


class InterviewMessage(BaseModel):
    role: str
    content: str
    feedback: str | None = None
    score: int | None = None


class AnswerFeedbackResponse(BaseModel):
    score: int
    feedback: str
    improvement: str
    model_answer_hint: str
    next_question: str


class InterviewSessionResponse(BaseModel):
    id: str
    user_id: str
    job_listing_id: str | None = None
    role_title: str
    interview_type: str
    messages: list[InterviewMessage]
    overall_score: int | None = None
    tips_generated: dict | None = None
    created_at: str
    completed_at: str | None = None


class InterviewTipCategory(BaseModel):
    title: str
    tips: list[str]
    example_answers: list[str] | None = None


class InterviewTipsResponse(BaseModel):
    categories: list[InterviewTipCategory]


class QuestionBankItem(BaseModel):
    question: str
    type: str
    difficulty: str
    role: str
