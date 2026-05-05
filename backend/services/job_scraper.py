import asyncio
import uuid
from datetime import datetime

import httpx

from backend.config import settings

_ADZUNA_BASE = "https://api.adzuna.com/v1/api/jobs/us/search/1"
_JSEARCH_BASE = "https://jsearch.p.rapidapi.com/search"


def _normalize_adzuna(job: dict) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "external_id": str(job.get("id", "")),
        "source": "adzuna",
        "title": job.get("title", ""),
        "company": job.get("company", {}).get("display_name", ""),
        "location": job.get("location", {}).get("display_name", ""),
        "remote_type": "remote" if "remote" in job.get("title", "").lower() else "onsite",
        "salary_min": int(job["salary_min"]) if job.get("salary_min") else None,
        "salary_max": int(job["salary_max"]) if job.get("salary_max") else None,
        "description": job.get("description", ""),
        "url": job.get("redirect_url", ""),
        "posted_at": job.get("created", None),
        "fetched_at": datetime.utcnow().isoformat(),
    }


def _normalize_jsearch(job: dict) -> dict:
    return {
        "id": str(uuid.uuid4()),
        "external_id": job.get("job_id", str(uuid.uuid4())),
        "source": "jsearch",
        "title": job.get("job_title", ""),
        "company": job.get("employer_name", ""),
        "location": f"{job.get('job_city', '')}, {job.get('job_country', '')}".strip(", "),
        "remote_type": "remote" if job.get("job_is_remote") else "onsite",
        "salary_min": job.get("job_min_salary"),
        "salary_max": job.get("job_max_salary"),
        "description": job.get("job_description", ""),
        "url": job.get("job_apply_link", ""),
        "posted_at": job.get("job_posted_at_datetime_utc"),
        "fetched_at": datetime.utcnow().isoformat(),
    }


async def _fetch_adzuna(query: str, location: str = "", page: int = 1) -> list[dict]:
    if not settings.adzuna_app_id or not settings.adzuna_api_key:
        return []

    params = {
        "app_id": settings.adzuna_app_id,
        "app_key": settings.adzuna_api_key,
        "results_per_page": 20,
        "what": query,
        "where": location,
        "page": page,
        "content-type": "application/json",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(_ADZUNA_BASE, params=params)
            resp.raise_for_status()
            return [_normalize_adzuna(j) for j in resp.json().get("results", [])]
    except Exception:
        return []


async def _fetch_jsearch(query: str, location: str = "", page: int = 1) -> list[dict]:
    if not settings.rapidapi_key:
        return []

    headers = {
        "X-RapidAPI-Key": settings.rapidapi_key,
        "X-RapidAPI-Host": "jsearch.p.rapidapi.com",
    }
    params = {
        "query": f"{query} {location}".strip(),
        "page": str(page),
        "num_pages": "1",
    }
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(_JSEARCH_BASE, headers=headers, params=params)
            resp.raise_for_status()
            return [_normalize_jsearch(j) for j in resp.json().get("data", [])]
    except Exception:
        return []


async def search_jobs(
    query: str,
    location: str = "",
    remote_type: str = "",
    salary_min: int | None = None,
    page: int = 1,
) -> list[dict]:
    adzuna_results, jsearch_results = await asyncio.gather(
        _fetch_adzuna(query, location, page),
        _fetch_jsearch(query, location, page),
    )

    combined = adzuna_results + jsearch_results

    # Deduplicate by title+company
    seen: set[tuple] = set()
    unique = []
    for job in combined:
        key = (job["title"].lower(), job["company"].lower())
        if key not in seen:
            seen.add(key)
            unique.append(job)

    # Filter by remote_type if specified
    if remote_type:
        unique = [j for j in unique if j["remote_type"] == remote_type]

    # Filter by salary_min if specified
    if salary_min is not None:
        unique = [
            j for j in unique
            if j.get("salary_max") is None or (j.get("salary_max") or 0) >= salary_min
        ]

    return unique
