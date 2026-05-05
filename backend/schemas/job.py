from pydantic import BaseModel


class JobResponse(BaseModel):
    id: str
    external_id: str
    source: str
    title: str
    company: str
    location: str
    remote_type: str
    salary_min: int | None = None
    salary_max: int | None = None
    description: str
    url: str
    posted_at: str | None = None
    fetched_at: str
    match_score: int | None = None

    class Config:
        from_attributes = True
