import json
import re

import anthropic

from backend.config import settings

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
_MODEL = "claude-sonnet-4-20250514"

_VALID_TYPES = {"behavioral", "technical", "system_design", "hr"}


def _system_prompt(role_title: str, interview_type: str) -> str:
    type_guidance = {
        "behavioral": "Use STAR method prompts (Situation, Task, Action, Result). Focus on past experiences.",
        "technical": "Include coding problems, algorithm questions, and technical concepts appropriate to the role.",
        "system_design": "Ask about designing scalable systems, trade-offs, and architecture decisions.",
        "hr": "Focus on culture fit, motivations, career goals, and soft skills.",
    }
    return (
        f"You are an expert technical recruiter and interview coach conducting a "
        f"{interview_type} interview for a {role_title} position.\n\n"
        f"Rules:\n"
        f"- Ask one question at a time\n"
        f"- Questions should be realistic and progressively challenging\n"
        f"- {type_guidance.get(interview_type, '')}\n"
        f"- Never reveal the next question until the user answers\n\n"
        f"Start with a warm professional introduction, then ask Question 1."
    )


def start_session(role_title: str, interview_type: str) -> str:
    """Returns the opening message (intro + first question) from Claude."""
    response = _client.messages.create(
        model=_MODEL,
        max_tokens=512,
        system=_system_prompt(role_title, interview_type),
        messages=[{"role": "user", "content": "Please begin the interview."}],
    )
    return response.content[0].text


def evaluate_answer(
    role_title: str,
    interview_type: str,
    conversation: list[dict],
    last_question: str,
    user_answer: str,
) -> dict:
    """
    Sends the full conversation + latest answer to Claude and returns
    structured feedback with score, tips, and the next question.
    """
    eval_prompt = (
        f'The candidate answered: "{user_answer}"\n'
        f'The question was: "{last_question}"\n'
        f"Role: {role_title}, Interview type: {interview_type}\n\n"
        "Respond ONLY with valid JSON in this exact shape:\n"
        '{"score": 7, "feedback": "...", "improvement": "...", '
        '"model_answer_hint": "...", "next_question": "..."}'
    )

    messages = list(conversation) + [{"role": "user", "content": eval_prompt}]

    response = _client.messages.create(
        model=_MODEL,
        max_tokens=768,
        system=_system_prompt(role_title, interview_type),
        messages=messages,
    )
    raw = response.content[0].text.strip()

    # Extract JSON even if Claude wraps it in markdown fences
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())

    raise ValueError(f"Could not parse Claude response as JSON: {raw[:200]}")


def generate_tips(role_title: str, interview_type: str) -> dict:
    response = _client.messages.create(
        model=_MODEL,
        max_tokens=1536,
        system="You are an expert interview coach.",
        messages=[
            {
                "role": "user",
                "content": (
                    f"Give me the top 10 interview tips for a {role_title} {interview_type} interview.\n"
                    "Include: common questions for this role, what interviewers really look for, "
                    "red flags to avoid, and 2-3 example strong answers.\n"
                    "Format as JSON: "
                    '{"categories": [{"title": "...", "tips": ["..."], "example_answers": ["..."]}]}'
                ),
            }
        ],
    )
    raw = response.content[0].text.strip()
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return {"categories": []}


def generate_question_bank(role: str, interview_type: str, difficulty: str = "medium") -> list[dict]:
    response = _client.messages.create(
        model=_MODEL,
        max_tokens=1024,
        system="You are an expert technical recruiter.",
        messages=[
            {
                "role": "user",
                "content": (
                    f"Generate 10 {difficulty} {interview_type} interview questions for a {role} role.\n"
                    "Return JSON: "
                    '{"questions": [{"question": "...", "type": "...", "difficulty": "...", "role": "..."}]}'
                ),
            }
        ],
    )
    raw = response.content[0].text.strip()
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        data = json.loads(json_match.group())
        return data.get("questions", [])
    return []


def generate_overall_summary(
    role_title: str,
    interview_type: str,
    messages: list[dict],
) -> tuple[int, dict]:
    """Returns (overall_score 0-100, tips dict) after session ends."""
    scored = [m for m in messages if m.get("score") is not None]
    if scored:
        avg = sum(m["score"] for m in scored) / len(scored)
        overall = round(avg * 10)
    else:
        overall = 0

    tips = generate_tips(role_title, interview_type)
    return overall, tips
