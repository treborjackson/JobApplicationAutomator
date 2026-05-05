from datetime import datetime
from sqlalchemy import String, DateTime, JSON, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base


class StudyPlan(Base):
    __tablename__ = "study_plans"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    role_title: Mapped[str] = mapped_column(String, nullable=False)
    seniority_level: Mapped[str] = mapped_column(String, nullable=False)
    duration_weeks: Mapped[int] = mapped_column(Integer, nullable=False)
    topics: Mapped[list] = mapped_column(JSON, default=list)
    progress_pct: Mapped[int] = mapped_column(Integer, default=0)
    generated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
