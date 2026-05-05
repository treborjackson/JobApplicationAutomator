from pydantic import BaseModel


class GenerateCoverLetterRequest(BaseModel):
    job_listing_id: str


class UpdateCoverLetterRequest(BaseModel):
    content: str


class CoverLetterResponse(BaseModel):
    id: str
    user_id: str
    job_listing_id: str
    content: str
    generated_at: str
    edited_at: str | None = None

    class Config:
        from_attributes = True
