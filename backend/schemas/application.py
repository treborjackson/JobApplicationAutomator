from pydantic import BaseModel


class SubmitApplicationRequest(BaseModel):
    job_listing_id: str
    cover_letter_id: str | None = None
    submission_method: str = "manual"
    notes: str | None = None


class UpdateStatusRequest(BaseModel):
    status: str


class ApplicationJobSummary(BaseModel):
    id: str
    title: str
    company: str
    location: str
    url: str


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    job_listing_id: str
    cover_letter_id: str | None = None
    status: str
    submission_method: str
    submitted_at: str
    last_updated_at: str
    notes: str | None = None
    job: ApplicationJobSummary | None = None

    class Config:
        from_attributes = True


class DashboardStats(BaseModel):
    total_applied: int
    interviews: int
    offers: int
    rejection_rate: float
