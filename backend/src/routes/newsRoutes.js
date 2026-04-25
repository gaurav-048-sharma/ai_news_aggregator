import express from "express";
import {
  getNews,
  getRecommendedNews,
  trackClick,
  semanticSearchHandler,
  getPersonalizedNews,
  searchNews,
  getTrendingNews,
  getMLStatus,
} from "../controllers/newsController.js";

const router = express.Router();

// Core routes
router.get("/", getNews);
router.post("/click", trackClick);

// ML-powered routes
router.get("/semantic-search", semanticSearchHandler);
router.get("/personalized/:userId", getPersonalizedNews);
router.get("/recommend/:id", getRecommendedNews);
router.get("/trending", getTrendingNews);

// Fallback keyword search
router.get("/search", searchNews);

// ML service health
router.get("/ml-status", getMLStatus);

export default router;