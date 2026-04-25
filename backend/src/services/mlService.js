import axios from "axios";

const ML_SERVICE_URL = process.env.ML_SERVICE_URL || "http://localhost:8000";

const mlClient = axios.create({
  baseURL: ML_SERVICE_URL,
  timeout: 30000,
});

/**
 * Classify a single article text
 */
export const classifyText = async (text) => {
  try {
    const res = await mlClient.post("/predict", { text });
    return res.data;
  } catch (error) {
    console.error("ML classify error:", error.message);
    return { category: "General", confidence: 0 };
  }
};

/**
 * Batch classify multiple texts at once
 */
export const batchClassify = async (texts) => {
  try {
    const res = await mlClient.post("/batch-classify", { texts });
    return res.data.results;
  } catch (error) {
    console.error("ML batch classify error:", error.message);
    return texts.map(() => ({ category: "General", confidence: 0 }));
  }
};

/**
 * Semantic search via ML embeddings
 */
export const semanticSearch = async (query, articles) => {
  try {
    const res = await mlClient.post("/semantic-search", { query, articles });
    return res.data.results;
  } catch (error) {
    console.error("ML semantic search error:", error.message);
    return [];
  }
};

/**
 * Smart ML-based ranking
 */
export const smartRank = async (articles, userPreferences = [], clickedCategories = []) => {
  try {
    const res = await mlClient.post("/smart-rank", {
      articles,
      user_preferences: userPreferences,
      clicked_categories: clickedCategories,
    });
    return res.data.results;
  } catch (error) {
    console.error("ML smart rank error:", error.message);
    return articles; // fallback: return unranked
  }
};

/**
 * Get ML-based article recommendations
 */
export const getMLRecommendations = async (targetArticle, articles, userPreferences = [], topN = 8) => {
  try {
    const res = await mlClient.post("/recommend", {
      target_article: targetArticle,
      articles,
      user_preferences: userPreferences,
      top_n: topN,
    });
    return res.data.results;
  } catch (error) {
    console.error("ML recommend error:", error.message);
    return [];
  }
};

/**
 * Health check
 */
export const checkMLHealth = async () => {
  try {
    const res = await mlClient.get("/health");
    return res.data;
  } catch (error) {
    return { status: "offline" };
  }
};
