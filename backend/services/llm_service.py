import anthropic
from backend.config import settings

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
_MODEL = "claude-sonnet-4-20250514"


def generate_cover_letter(
    resume_data: dict,
    job_title: str,
    company: str,
    job_description: str,
) -> str:
    skills = ", ".join(resume_data.get("parsed_skills", [])[:15])
    experience_lines = []
    for exp in resume_data.get("parsed_experience", [])[:3]:
        experience_lines.append(f"- {exp.get('title')} at {exp.get('company')}: {exp.get('description', '')[:120]}")
    experience_summary = "\n".join(experience_lines) or "See attached resume."

    achievements = "\n".join(
        f"- {a}" for a in resume_data.get("parsed_achievements", [])[:4]
    ) or "See attached resume."

    message = _client.messages.create(
        model=_MODEL,
        max_tokens=1024,
        system="You are an expert career coach and professional writer.",
        messages=[
            {
                "role": "user",
                "content": f"""Resume Summary:
Skills: {skills}
Recent Experience:
{experience_summary}
Key Achievements:
{achievements}

Job Title: {job_title} at {company}
Job Description (excerpt): {job_description[:1500]}

Write a 3-paragraph cover letter:
1. Strong hook connecting the candidate to this specific role
2. 2-3 resume achievements that directly match job requirements
3. Enthusiastic close with call to action
Under 350 words. Professional tone. First person. No placeholders.""",
            }
        ],
    )
    return message.content[0].text
