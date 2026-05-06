from pydantic import BaseModel


class StudyResource(BaseModel):
    type: str
    title: str
    url: str


class StudyTopic(BaseModel):
    title: str
    description: str
    estimated_hours: int
    resources: list[StudyResource]
    practice: str
    done: bool = False


class StudyWeek(BaseModel):
    week: int
    theme: str
    topics: list[StudyTopic]


class GenerateStudyPlanRequest(BaseModel):
    role_title: str
    seniority_level: str
    duration_weeks: int
    current_skills: list[str] | None = None


class MarkTopicRequest(BaseModel):
    done: bool


class StudyPlanResponse(BaseModel):
    id: str
    user_id: str
    role_title: str
    seniority_level: str
    duration_weeks: int
    topics: list[StudyTopic]
    progress_pct: int
    generated_at: str
    last_updated_at: str
    weekly_hours_required: int | None = None
    overview: str | None = None
    weeks: list[StudyWeek] | None = None
    final_project: str | None = None
    interview_readiness_milestones: list[str] | None = None


class StudyPlanTemplateResponse(BaseModel):
    role: str
    seniority: str
    duration_weeks: int
    overview: str
    weeks: list[StudyWeek]
