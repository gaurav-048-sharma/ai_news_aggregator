from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import joblib
import numpy as np
import os

app = FastAPI(title="AI News ML Service", version="2.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Load Models ───────────────────────────────────────────────
print("[*] Loading ML models...")

# Sentence Transformer for semantic understanding
semantic_model = SentenceTransformer("all-MiniLM-L6-v2")

# Category classifier (TF-IDF + LogisticRegression)
classifier = None
vectorizer = None
if os.path.exists("model.pkl") and os.path.exists("vectorizer.pkl"):
    classifier = joblib.load("model.pkl")
    vectorizer = joblib.load("vectorizer.pkl")
    print("[+] Category classifier loaded")
else:
    print("[!] No classifier found - run train.py first")

print("[+] Sentence Transformer loaded")
print("[+] ML Service ready!")


# ─── Request Schemas ───────────────────────────────────────────
class PredictRequest(BaseModel):
    text: str

class BatchPredictRequest(BaseModel):
    texts: list[str]

class ArticleInput(BaseModel):
    _id: str = ""
    title: str = ""
    description: str = ""
    image: str = ""
    category: str = ""
    source: str = ""
    publishedAt: str = ""
    url: str = ""
    clicks: int = 0

class SemanticSearchRequest(BaseModel):
    query: str
    articles: list[dict]

class SmartRankRequest(BaseModel):
    articles: list[dict]
    user_preferences: list[str] = []
    clicked_categories: list[str] = []

class RecommendRequest(BaseModel):
    target_article: dict
    articles: list[dict]
    user_preferences: list[str] = []
    top_n: int = 8


# ─── Helper Functions ──────────────────────────────────────────
def get_text(article: dict) -> str:
    """Combine title + description for embedding."""
    title = article.get("title", "") or ""
    desc = article.get("description", "") or ""
    return f"{title} {desc}".strip()

def compute_recency_score(published_at: str) -> float:
    """Score based on how recent the article is (0-1)."""
    from datetime import datetime, timezone
    try:
        if isinstance(published_at, str) and published_at:
            pub = datetime.fromisoformat(published_at.replace("Z", "+00:00"))
            hours_ago = (datetime.now(timezone.utc) - pub).total_seconds() / 3600
            return 1.0 / (1.0 + hours_ago / 6.0)  # half-life of 6 hours
    except:
        pass
    return 0.3  # default for unknown dates


# ─── Endpoints ─────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "models": ["sentence-transformer", "category-classifier"]}


@app.post("/predict")
def predict(req: PredictRequest):
    """Classify a single text into a category with confidence."""
    if not classifier or not vectorizer:
        return {"category": "General", "confidence": 0.0}

    X = vectorizer.transform([req.text])
    prediction = classifier.predict(X)[0]
    probabilities = classifier.predict_proba(X)[0]
    confidence = float(max(probabilities))

    # Get all category probabilities
    categories = classifier.classes_.tolist()
    category_scores = {cat: float(prob) for cat, prob in zip(categories, probabilities)}

    return {
        "category": prediction,
        "confidence": round(confidence, 3),
        "all_scores": category_scores,
    }


@app.post("/batch-classify")
def batch_classify(req: BatchPredictRequest):
    """Classify multiple texts at once for efficient ingestion."""
    if not classifier or not vectorizer:
        return {"results": [{"category": "General", "confidence": 0.0} for _ in req.texts]}

    X = vectorizer.transform(req.texts)
    predictions = classifier.predict(X)
    probabilities = classifier.predict_proba(X)

    results = []
    for i, text in enumerate(req.texts):
        confidence = float(max(probabilities[i]))
        results.append({
            "category": predictions[i],
            "confidence": round(confidence, 3),
        })

    return {"results": results}


@app.post("/semantic-search")
def semantic_search(data: SemanticSearchRequest):
    """Embedding-based semantic search with relevance scores."""
    query = data.query
    articles = data.articles

    if not articles:
        return {"results": []}

    # Combine title + description for each article
    texts = [get_text(a) for a in articles]

    # Encode everything
    article_embeddings = semantic_model.encode(texts, show_progress_bar=False)
    query_embedding = semantic_model.encode([query], show_progress_bar=False)

    # Cosine similarity
    scores = cosine_similarity(query_embedding, article_embeddings)[0]

    # Build results with scores and explanations
    results = []
    for i, article in enumerate(articles):
        similarity = float(scores[i])
        if similarity < 0.05:  # filter out very irrelevant results
            continue

        # Generate explanation
        explanation = _generate_search_explanation(query, article, similarity)

        results.append({
            **article,
            "score": round(similarity, 4),
            "relevance_pct": round(similarity * 100, 1),
            "explanation": explanation,
            "match_type": "semantic",
        })

    # Sort by score descending
    results.sort(key=lambda x: x["score"], reverse=True)

    return {"results": results[:20]}


@app.post("/smart-rank")
def smart_rank(data: SmartRankRequest):
    """ML-driven ranking combining multiple signals."""
    articles = data.articles
    user_prefs = data.user_preferences
    clicked_cats = data.clicked_categories

    if not articles:
        return {"results": []}

    # Compute embeddings for all articles 
    texts = [get_text(a) for a in articles]
    embeddings = semantic_model.encode(texts, show_progress_bar=False)

    # Build user interest embedding from preferences
    user_interest_embedding = None
    if user_prefs:
        pref_text = " ".join(user_prefs)
        user_interest_embedding = semantic_model.encode([pref_text], show_progress_bar=False)

    results = []
    for i, article in enumerate(articles):
        # 1. User interest score (cosine similarity to preference embedding)
        interest_score = 0.0
        if user_interest_embedding is not None:
            interest_score = float(
                cosine_similarity(user_interest_embedding, [embeddings[i]])[0][0]
            )

        # 2. Category preference score
        category = article.get("category", "General")
        cat_score = 0.0
        if category in user_prefs:
            cat_score = 1.0
        elif category in clicked_cats:
            cat_score = 0.6

        # 3. Recency score
        recency = compute_recency_score(article.get("publishedAt", ""))

        # 4. Popularity score (normalized clicks)
        clicks = article.get("clicks", 0) or 0
        popularity = min(clicks / 50.0, 1.0)  # cap at 50 clicks

        # 5. Combined ML score with weights
        ml_score = (
            interest_score * 0.30 +
            cat_score * 0.25 +
            recency * 0.25 +
            popularity * 0.20
        )

        # Generate explanation
        explanation = _generate_rank_explanation(
            interest_score, cat_score, recency, popularity, category, user_prefs
        )

        results.append({
            **article,
            "ml_score": round(ml_score, 4),
            "interest_score": round(interest_score, 3),
            "recency_score": round(recency, 3),
            "popularity_score": round(popularity, 3),
            "category_match": round(cat_score, 2),
            "explanation": explanation,
        })

    # Sort by ML score
    results.sort(key=lambda x: x["ml_score"], reverse=True)

    return {"results": results}


@app.post("/recommend")
def recommend(data: RecommendRequest):
    """Content-based recommendations using embeddings."""
    target = data.target_article
    articles = data.articles
    user_prefs = data.user_preferences
    top_n = data.top_n

    if not articles:
        return {"results": []}

    # Get target embedding
    target_text = get_text(target)
    target_embedding = semantic_model.encode([target_text], show_progress_bar=False)

    # Get all article embeddings
    texts = [get_text(a) for a in articles]
    embeddings = semantic_model.encode(texts, show_progress_bar=False)

    # Compute similarities
    similarities = cosine_similarity(target_embedding, embeddings)[0]

    results = []
    target_id = target.get("_id", "")

    for i, article in enumerate(articles):
        # Skip the target article itself
        if article.get("_id", "") == target_id:
            continue

        sim_score = float(similarities[i])

        # Boost if category matches user preferences
        cat_boost = 0.1 if article.get("category", "") in user_prefs else 0.0
        final_score = sim_score + cat_boost

        # Determine recommendation reason
        reason = _generate_recommendation_reason(target, article, sim_score)

        results.append({
            **article,
            "similarity_score": round(sim_score, 4),
            "recommendation_score": round(final_score, 4),
            "reason": reason,
        })

    results.sort(key=lambda x: x["recommendation_score"], reverse=True)

    return {"results": results[:top_n]}


# ─── Explanation Generators ────────────────────────────────────

def _generate_search_explanation(query: str, article: dict, score: float) -> str:
    if score > 0.7:
        return f"Highly relevant to '{query}'"
    elif score > 0.4:
        return f"Related content about '{query}'"
    elif score > 0.2:
        return f"Loosely related to '{query}'"
    else:
        return "Tangentially related"

def _generate_rank_explanation(
    interest: float, cat_match: float, recency: float,
    popularity: float, category: str, prefs: list
) -> str:
    reasons = []
    if cat_match >= 1.0:
        reasons.append(f"Matches your interest in {category}")
    elif cat_match > 0:
        reasons.append(f"Similar to categories you've read")
    if interest > 0.5:
        reasons.append("Closely aligned with your reading history")
    if recency > 0.7:
        reasons.append("Recently published")
    if popularity > 0.5:
        reasons.append("Popular among readers")

    if not reasons:
        reasons.append("Recommended for you")

    return " · ".join(reasons)

def _generate_recommendation_reason(target: dict, article: dict, score: float) -> str:
    target_cat = target.get("category", "")
    article_cat = article.get("category", "")

    if score > 0.6:
        return f"Very similar to \"{target.get('title', 'this article')[:50]}...\""
    elif target_cat and target_cat == article_cat:
        return f"Same category: {target_cat}"
    elif score > 0.3:
        return "Related topic"
    else:
        return "You might also like"