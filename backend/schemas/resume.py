from pydantic import BaseModel


class ResumeExperience(BaseModel):
    title: str
    company: str
    start_date: str
    end_date: str | None = None
    description: str


class ResumeEducation(BaseModel):
    degree: str
    institution: str
    graduation_year: str


class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    file_path: str
    raw_text: str
    parsed_skills: list[str]
    parsed_experience: list[ResumeExperience]
    parsed_education: list[ResumeEducation]
    parsed_achievements: list[str]
    uploaded_at: str
    updated_at: str

    class Config:
        from_attributes = True
