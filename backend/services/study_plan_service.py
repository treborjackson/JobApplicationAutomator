import json
import re

import anthropic

from backend.config import settings

_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
_MODEL = "claude-sonnet-4-20250514"

_VALID_SENIORITY = {"junior", "mid", "senior", "staff", "principal"}
_VALID_DURATIONS = {1, 2, 4, 8, 12}


def generate_study_plan(
    role_title: str,
    seniority_level: str,
    duration_weeks: int,
    current_skills: list[str] | None = None,
) -> dict:
    skills_str = ", ".join(current_skills) if current_skills else "not specified"

    response = _client.messages.create(
        model=_MODEL,
        max_tokens=4096,
        system="You are a senior engineering mentor and career coach.",
        messages=[
            {
                "role": "user",
                "content": f"""Create a {duration_weeks}-week study plan for someone preparing for a
{seniority_level} {role_title} role.

Their current skills from resume: {skills_str}

Return ONLY valid JSON with this exact structure:
{{
  "role": "{role_title}",
  "seniority": "{seniority_level}",
  "duration_weeks": {duration_weeks},
  "weekly_hours_required": 10,
  "overview": "Brief summary of the plan",
  "weeks": [
    {{
      "week": 1,
      "theme": "Foundations",
      "topics": [
        {{
          "title": "Topic name",
          "description": "What to learn and why it matters",
          "estimated_hours": 3,
          "resources": [
            {{"type": "video", "title": "Resource title", "url": "https://example.com"}}
          ],
          "practice": "Hands-on exercise or mini-project",
          "done": false
        }}
      ]
    }}
  ],
  "final_project": "Capstone project description",
  "interview_readiness_milestones": ["Week 2: ...", "Week 4: ..."]
}}""",
            }
        ],
    )

    raw = response.content[0].text.strip()
    json_match = re.search(r"\{.*\}", raw, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    raise ValueError(f"Could not parse Claude response as JSON: {raw[:200]}")


def flatten_topics(weeks: list[dict]) -> list[dict]:
    """Flatten weekly topics into a single list for DB storage."""
    topics = []
    for week in weeks:
        for topic in week.get("topics", []):
            topics.append({**topic, "week": week.get("week"), "theme": week.get("theme")})
    return topics


def compute_progress(topics: list[dict]) -> int:
    if not topics:
        return 0
    done = sum(1 for t in topics if t.get("done"))
    return round((done / len(topics)) * 100)


# ---------------------------------------------------------------------------
# Pre-built templates (no LLM call needed)
# ---------------------------------------------------------------------------

_TEMPLATES: list[dict] = [
    {
        "role": "Software Engineer",
        "seniority": "junior",
        "duration_weeks": 4,
        "overview": "Covers core CS fundamentals, data structures, algorithms, and one full-stack project.",
        "weeks": [
            {
                "week": 1, "theme": "CS Fundamentals & Data Structures",
                "topics": [
                    {
                        "title": "Big-O Notation & Complexity",
                        "description": "Understand time and space complexity analysis.",
                        "estimated_hours": 3,
                        "resources": [
                            {"type": "article", "title": "Big-O Cheat Sheet", "url": "https://bigocheatsheet.com"}
                        ],
                        "practice": "Solve 5 easy LeetCode problems analyzing complexity.",
                        "done": False,
                    },
                    {
                        "title": "Arrays, Linked Lists, Stacks, Queues",
                        "description": "Master the four core linear data structures.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "course", "title": "Data Structures — CS50", "url": "https://cs50.harvard.edu"}
                        ],
                        "practice": "Implement each structure from scratch in your preferred language.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 2, "theme": "Algorithms",
                "topics": [
                    {
                        "title": "Sorting & Searching",
                        "description": "QuickSort, MergeSort, BinarySearch — know them cold.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "video", "title": "Sorting Algorithms Visualized", "url": "https://visualgo.net"}
                        ],
                        "practice": "Implement merge sort and binary search without references.",
                        "done": False,
                    },
                    {
                        "title": "Recursion & Trees",
                        "description": "Tree traversals (BFS/DFS), recursion patterns.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "book", "title": "Cracking the Coding Interview", "url": "https://www.crackingthecodinginterview.com"}
                        ],
                        "practice": "Solve 10 tree problems on LeetCode.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 3, "theme": "System Basics & Databases",
                "topics": [
                    {
                        "title": "SQL & Relational Databases",
                        "description": "JOINs, indexes, transactions, normalization.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "course", "title": "SQLZoo", "url": "https://sqlzoo.net"}
                        ],
                        "practice": "Build a simple schema with 3 related tables and write complex queries.",
                        "done": False,
                    },
                    {
                        "title": "REST APIs & HTTP",
                        "description": "HTTP methods, status codes, REST principles.",
                        "estimated_hours": 3,
                        "resources": [
                            {"type": "article", "title": "REST API Tutorial", "url": "https://restapitutorial.com"}
                        ],
                        "practice": "Build a simple CRUD REST API.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 4, "theme": "Capstone & Interview Prep",
                "topics": [
                    {
                        "title": "Full-Stack Mini Project",
                        "description": "Build a small end-to-end app to showcase in interviews.",
                        "estimated_hours": 8,
                        "resources": [
                            {"type": "article", "title": "Project Ideas for Developers", "url": "https://github.com/florinpop17/app-ideas"}
                        ],
                        "practice": "Deploy to a free host (Vercel/Render) and write a README.",
                        "done": False,
                    },
                    {
                        "title": "Behavioral Interview Prep",
                        "description": "Prepare STAR answers for common behavioral questions.",
                        "estimated_hours": 2,
                        "resources": [
                            {"type": "article", "title": "STAR Method Guide", "url": "https://www.indeed.com/career-advice/interviewing/how-to-use-the-star-interview-response-technique"}
                        ],
                        "practice": "Write out 5 STAR stories from your experience.",
                        "done": False,
                    },
                ],
            },
        ],
    },
    {
        "role": "Data Scientist",
        "seniority": "mid",
        "duration_weeks": 4,
        "overview": "Covers statistics, ML fundamentals, Python data stack, and model deployment.",
        "weeks": [
            {
                "week": 1, "theme": "Statistics & Probability",
                "topics": [
                    {
                        "title": "Descriptive & Inferential Statistics",
                        "description": "Mean, variance, hypothesis testing, p-values.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "course", "title": "Khan Academy Statistics", "url": "https://www.khanacademy.org/math/statistics-probability"}
                        ],
                        "practice": "Analyze a public dataset and write a statistical summary.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 2, "theme": "Machine Learning Fundamentals",
                "topics": [
                    {
                        "title": "Supervised Learning",
                        "description": "Linear/logistic regression, decision trees, random forests.",
                        "estimated_hours": 5,
                        "resources": [
                            {"type": "course", "title": "Andrew Ng ML Course", "url": "https://www.coursera.org/learn/machine-learning"}
                        ],
                        "practice": "Train and evaluate a classifier on a Kaggle dataset.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 3, "theme": "Python Data Stack",
                "topics": [
                    {
                        "title": "Pandas, NumPy, Matplotlib",
                        "description": "Data wrangling, numerical computing, visualization.",
                        "estimated_hours": 5,
                        "resources": [
                            {"type": "course", "title": "Kaggle Learn — Pandas", "url": "https://www.kaggle.com/learn/pandas"}
                        ],
                        "practice": "Complete an end-to-end EDA notebook on a real dataset.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 4, "theme": "Model Deployment & Portfolio",
                "topics": [
                    {
                        "title": "MLflow & Model Serving",
                        "description": "Track experiments, package models, serve predictions.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "article", "title": "MLflow Quickstart", "url": "https://mlflow.org/docs/latest/quickstart.html"}
                        ],
                        "practice": "Deploy a model as a REST endpoint.",
                        "done": False,
                    },
                ],
            },
        ],
    },
    {
        "role": "Frontend Developer",
        "seniority": "mid",
        "duration_weeks": 4,
        "overview": "Deep dive into React, TypeScript, performance, and accessibility.",
        "weeks": [
            {
                "week": 1, "theme": "React & TypeScript",
                "topics": [
                    {
                        "title": "Advanced React Patterns",
                        "description": "Hooks, context, compound components, render props.",
                        "estimated_hours": 5,
                        "resources": [
                            {"type": "course", "title": "Epic React by Kent C. Dodds", "url": "https://epicreact.dev"}
                        ],
                        "practice": "Refactor a class component app to hooks.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 2, "theme": "State Management & Data Fetching",
                "topics": [
                    {
                        "title": "React Query & Zustand",
                        "description": "Server state vs client state, caching strategies.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "article", "title": "TanStack Query Docs", "url": "https://tanstack.com/query"}
                        ],
                        "practice": "Build a paginated list with React Query and optimistic updates.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 3, "theme": "Performance & Testing",
                "topics": [
                    {
                        "title": "Web Vitals & Optimization",
                        "description": "LCP, FID, CLS — measure and improve.",
                        "estimated_hours": 4,
                        "resources": [
                            {"type": "article", "title": "web.dev Performance", "url": "https://web.dev/performance"}
                        ],
                        "practice": "Audit and optimize a slow React app using Lighthouse.",
                        "done": False,
                    },
                ],
            },
            {
                "week": 4, "theme": "Accessibility & Portfolio",
                "topics": [
                    {
                        "title": "WCAG & ARIA",
                        "description": "Build accessible components that pass screen reader tests.",
                        "estimated_hours": 3,
                        "resources": [
                            {"type": "course", "title": "Deque University — Web Accessibility", "url": "https://dequeuniversity.com"}
                        ],
                        "practice": "Audit an existing project with axe DevTools and fix all issues.",
                        "done": False,
                    },
                ],
            },
        ],
    },
]


def get_templates(role: str | None = None) -> list[dict]:
    if role:
        return [t for t in _TEMPLATES if role.lower() in t["role"].lower()]
    return _TEMPLATES
