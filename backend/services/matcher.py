from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


def score_job_match(resume_text: str, job_description: str) -> int:
    """Return a 0-100 match score using TF-IDF cosine similarity."""
    if not resume_text.strip() or not job_description.strip():
        return 0

    vectorizer = TfidfVectorizer(stop_words="english", max_features=5000)
    try:
        tfidf = vectorizer.fit_transform([resume_text, job_description])
        score = cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0]
        return round(float(score) * 100)
    except Exception:
        return 0
