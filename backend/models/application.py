from datetime import datetime
from sqlalchemy import String, DateTime, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from backend.database import Base


class Application(Base):
    __tablename__ = "applications"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False, index=True)
    job_listing_id: Mapped[str] = mapped_column(String, ForeignKey("job_listings.id"), nullable=False)
    cover_letter_id: Mapped[str | None] = mapped_column(String, ForeignKey("cover_letters.id"), nullable=True)
    status: Mapped[str] = mapped_column(String, nullable=False, default="pending")
    submission_method: Mapped[str] = mapped_column(String, nullable=False, default="manual")
    submitted_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    last_updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
