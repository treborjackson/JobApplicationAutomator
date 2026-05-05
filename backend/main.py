from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routers import auth, resume, jobs, cover_letters

app = FastAPI(title="Job Application Automator API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8081"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(resume.router)
app.include_router(jobs.router)
app.include_router(cover_letters.router)
