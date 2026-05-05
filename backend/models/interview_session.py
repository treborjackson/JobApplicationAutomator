from datetime import datetime
from sqlalchemy import String, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base


class InterviewSession(Base):
    __tablename__ = "interview_sessions"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    job_listing_id: Mapped[str | None] = mapped_column(String, ForeignKey("job_listings.id"), nullable=True)
    role_title: Mapped[str] = mapped_column(String, nullable=False)
    interview_type: Mapped[str] = mapped_column(String, nullable=False)
    messages: Mapped[list] = mapped_column(JSON, default=list)
    overall_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    tips_generated: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
