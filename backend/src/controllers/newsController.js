import { fetchTopHeadlines } from "../services/newsService.js";
import {
  batchClassify,
  semanticSearch as mlSemanticSearch,
  smartRank,
  getMLRecommendations,
  checkMLHealth,
} from "../services/mlService.js";
import News from "../models/News.js";
import User from "../models/User.js";

// ─── Fetch + Classify + Store News ──────────────────────────────
export const getNews = async (req, res) => {
  try {
    const articles = await fetchTopHeadlines();

    // Batch classify all articles at once (efficient!)
    const texts = articles.map(
      (a) => `${a.title || ""} ${a.description || ""}`
    );
    const classifications = await batchClassify(texts);

    const cleaned = articles.map((article, i) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      image: article.urlToImage,
      publishedAt: article.publishedAt,
      source: article.source?.name,
      category: classifications[i]?.category || "General",
      categoryConfidence: classifications[i]?.confidence || 0,
    }));

    // Upsert all articles to DB
    const bulkOps = cleaned.map((article) => ({
      updateOne: {
        filter: { url: article.url },
        update: { $set: article },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await News.bulkWrite(bulkOps);
    }

    const storedNews = await News.find().sort({ publishedAt: -1 }).limit(30);

    res.json({
      success: true,
      data: storedNews,
      mlStatus: "classified",
    });
  } catch (error) {
    console.error("getNews error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching news",
    });
  }
};

// ─── ML-Powered Personalized Feed ──────────────────────────────
export const getPersonalizedNews = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findOne({ userId });
    const allNews = await News.find().lean();

    if (!allNews.length) {
      return res.json({ success: true, data: [] });
    }

    // Prepare articles for ML ranking
    const articlesForML = allNews.map((a) => ({
      _id: a._id.toString(),
      title: a.title,
      description: a.description,
      image: a.image,
      category: a.category,
      source: a.source,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : "",
      url: a.url,
      clicks: a.clicks || 0,
      categoryConfidence: a.categoryConfidence || 0,
    }));

    // Get user preferences
    const userPrefs = user?.preferences || [];
    const clickedCategories = user?.categoryClickCounts
      ? [...user.categoryClickCounts.keys()]
      : [];

    // Smart ML ranking
    const ranked = await smartRank(articlesForML, userPrefs, clickedCategories);

    // Limit to top 30
    const result = ranked.slice(0, 30);

    res.json({
      success: true,
      data: result,
      mlStatus: "smart-ranked",
      userPreferences: userPrefs,
    });
  } catch (error) {
    console.error("getPersonalizedNews error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error fetching personalized news",
    });
  }
};

// ─── ML Semantic Search ────────────────────────────────────────
export const semanticSearchHandler = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim() === "") {
      return res.json({ success: true, data: [] });
    }

    const articles = await News.find().lean().limit(100);

    const articlesForML = articles.map((a) => ({
      _id: a._id.toString(),
      title: a.title,
      description: a.description,
      image: a.image,
      category: a.category,
      source: a.source,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : "",
      url: a.url,
      clicks: a.clicks || 0,
      categoryConfidence: a.categoryConfidence || 0,
    }));

    const results = await mlSemanticSearch(q, articlesForML);

    res.json({
      success: true,
      data: results,
      query: q,
      mlStatus: "semantic-search",
    });
  } catch (error) {
    console.error("semanticSearch error:", error.message);
    res.status(500).json({
      success: false,
      message: "Semantic search failed",
    });
  }
};

// ─── ML-Based Recommendations ──────────────────────────────────
export const getRecommendedNews = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.query.userId;

    // Find target article
    const targetArticle = await News.findById(id).lean();
    if (!targetArticle) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Get all other articles
    const allArticles = await News.find({ _id: { $ne: id } }).lean();

    // Get user preferences if available
    let userPrefs = [];
    if (userId) {
      const user = await User.findOne({ userId });
      userPrefs = user?.preferences || [];
    }

    // Prepare for ML
    const targetForML = {
      _id: targetArticle._id.toString(),
      title: targetArticle.title,
      description: targetArticle.description,
      category: targetArticle.category,
    };

    const articlesForML = allArticles.map((a) => ({
      _id: a._id.toString(),
      title: a.title,
      description: a.description,
      image: a.image,
      category: a.category,
      source: a.source,
      publishedAt: a.publishedAt ? a.publishedAt.toISOString() : "",
      url: a.url,
      clicks: a.clicks || 0,
      categoryConfidence: a.categoryConfidence || 0,
    }));

    const recommendations = await getMLRecommendations(
      targetForML,
      articlesForML,
      userPrefs,
      8
    );

    res.json({
      success: true,
      data: recommendations,
      mlStatus: "embedding-recommendations",
    });
  } catch (error) {
    console.error("getRecommendedNews error:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to get recommendations",
    });
  }
};

// ─── Enhanced Click Tracking ───────────────────────────────────
export const trackClick = async (req, res) => {
  try {
    const { userId, articleId } = req.body;

    const article = await News.findById(articleId);
    if (!article) {
      return res.status(404).json({ message: "Article not found" });
    }

    // Increment click count on the article
    article.clicks = (article.clicks || 0) + 1;
    await article.save();

    // Update user profile
    let user = await User.findOne({ userId });
    if (!user) {
      user = new User({
        userId,
        preferences: [],
        clickedArticles: [],
        interactionHistory: [],
        categoryClickCounts: new Map(),
      });
    }

    // Add clicked article
    if (!user.clickedArticles.includes(articleId)) {
      user.clickedArticles.push(articleId);
    }

    // Add category to preferences
    const category = article.category || "General";
    if (!user.preferences.includes(category)) {
      user.preferences.push(category);
    }

    // Update category click counts
    const currentCount = user.categoryClickCounts?.get(category) || 0;
    user.categoryClickCounts.set(category, currentCount + 1);

    // Add to interaction history
    user.interactionHistory.push({
      articleId,
      category,
      timestamp: new Date(),
    });

    // Keep only last 100 interactions
    if (user.interactionHistory.length > 100) {
      user.interactionHistory = user.interactionHistory.slice(-100);
    }

    await user.save();

    res.json({
      success: true,
      clicks: article.clicks,
      preferences: user.preferences,
    });
  } catch (error) {
    console.error("trackClick error:", error.message);
    res.status(500).json({
      success: false,
      message: "Error tracking click",
    });
  }
};

// ─── ML-Enhanced Trending ──────────────────────────────────────
export const getTrendingNews = async (req, res) => {
  try {
    const trending = await News.find()
      .sort({ clicks: -1, publishedAt: -1 })
      .limit(10)
      .lean();

    // Add trending rank and labels
    const enriched = trending.map((article, index) => ({
      ...article,
      trendingRank: index + 1,
      isTrending: true,
      trendLabel:
        index === 0
          ? "Top Story"
          : index < 3
            ? "Hot"
            : "Trending",
    }));

    res.json({
      success: true,
      data: enriched,
    });
  } catch (error) {
    console.error("getTrendingNews error:", error.message);
    res.status(500).json({ message: "Error fetching trending news" });
  }
};

// ─── Keyword Search (fallback) ─────────────────────────────────
export const searchNews = async (req, res) => {
  try {
    const { q } = req.query;

    const results = await News.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { category: { $regex: q, $options: "i" } },
      ],
    }).limit(20);

    res.json({
      success: true,
      data: results,
      searchType: "keyword",
    });
  } catch (error) {
    res.status(500).json({ message: "Search error" });
  }
};

// ─── ML Service Health Check ───────────────────────────────────
export const getMLStatus = async (req, res) => {
  try {
    const health = await checkMLHealth();
    res.json({
      success: true,
      mlService: health,
    });
  } catch (error) {
    res.json({
      success: false,
      mlService: { status: "offline" },
    });
  }
};