import io
import re
from pathlib import Path

import pdfplumber
import spacy
from docx import Document

# Load once at import time; falls back gracefully if model not yet downloaded.
try:
    _nlp = spacy.load("en_core_web_sm")
except OSError:
    _nlp = None

# Common tech skills for keyword extraction
_SKILL_KEYWORDS = {
    "python", "javascript", "typescript", "java", "go", "rust", "c++", "c#",
    "react", "vue", "angular", "nextjs", "node", "fastapi", "django", "flask",
    "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
    "aws", "gcp", "azure", "docker", "kubernetes", "terraform", "ci/cd",
    "machine learning", "deep learning", "pytorch", "tensorflow", "sql",
    "graphql", "rest", "grpc", "kafka", "rabbitmq", "celery",
    "git", "linux", "bash", "agile", "scrum",
}

_ACHIEVEMENT_PATTERNS = [
    r"(?:increased|improved|reduced|cut|grew|scaled|optimized|built|launched|led|managed|"
    r"delivered|saved|generated|drove)\b.{10,120}",
]

_EDUCATION_KEYWORDS = {
    "bachelor", "master", "phd", "doctorate", "b\.s", "m\.s", "b\.a", "m\.a",
    "mba", "associate", "diploma", "certificate",
}

_DATE_PATTERN = re.compile(
    r"(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s*\d{4}"
    r"|\d{4}\s*[-–]\s*(?:\d{4}|present|current)",
    re.IGNORECASE,
)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def extract_text(file_bytes: bytes, filename: str) -> str:
    suffix = Path(filename).suffix.lower()
    if suffix == ".pdf":
        return extract_text_from_pdf(file_bytes)
    if suffix in {".docx", ".doc"}:
        return extract_text_from_docx(file_bytes)
    raise ValueError(f"Unsupported file type: {suffix}")


def _extract_skills(text: str) -> list[str]:
    lower = text.lower()
    found = [skill for skill in _SKILL_KEYWORDS if skill in lower]
    return sorted(set(found))


def _extract_achievements(text: str) -> list[str]:
    results = []
    for pattern in _ACHIEVEMENT_PATTERNS:
        for match in re.finditer(pattern, text, re.IGNORECASE):
            sentence = match.group(0).strip().rstrip(".,;")
            if len(sentence) > 20:
                results.append(sentence)
    return results[:10]


def _extract_education(text: str) -> list[dict]:
    education = []
    lines = text.split("\n")
    for i, line in enumerate(lines):
        lower = line.lower()
        if any(re.search(kw, lower) for kw in _EDUCATION_KEYWORDS):
            degree = line.strip()
            institution = lines[i + 1].strip() if i + 1 < len(lines) else ""
            dates = _DATE_PATTERN.findall(line + " " + institution)
            graduation_year = dates[-1] if dates else ""
            if degree:
                education.append({
                    "degree": degree,
                    "institution": institution,
                    "graduation_year": graduation_year,
                })
    return education[:5]


def _extract_experience(text: str, nlp) -> list[dict]:
    """Heuristic: look for ORG entities near date ranges as job blocks."""
    if nlp is None:
        return []

    experience = []
    doc = nlp(text[:50000])  # cap for performance
    orgs = [ent.text for ent in doc.ents if ent.label_ == "ORG"]

    lines = text.split("\n")
    for i, line in enumerate(lines):
        dates = _DATE_PATTERN.findall(line)
        if not dates:
            continue
        # Grab surrounding lines as context
        context = " ".join(lines[max(0, i - 2): i + 3])
        company = next((o for o in orgs if o in context), "")
        title = lines[i - 1].strip() if i > 0 else ""
        if title and len(title) < 80:
            date_str = dates[0]
            end_str = dates[1] if len(dates) > 1 else None
            description = " ".join(lines[i + 1: i + 4]).strip()
            experience.append({
                "title": title,
                "company": company,
                "start_date": date_str,
                "end_date": end_str,
                "description": description[:300],
            })

    seen = set()
    unique = []
    for exp in experience:
        key = (exp["title"], exp["company"])
        if key not in seen:
            seen.add(key)
            unique.append(exp)
    return unique[:10]


def parse_resume(file_bytes: bytes, filename: str) -> dict:
    raw_text = extract_text(file_bytes, filename)
    nlp = _nlp

    return {
        "raw_text": raw_text,
        "parsed_skills": _extract_skills(raw_text),
        "parsed_experience": _extract_experience(raw_text, nlp),
        "parsed_education": _extract_education(raw_text),
        "parsed_achievements": _extract_achievements(raw_text),
    }
