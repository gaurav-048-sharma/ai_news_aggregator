import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Core
export const fetchNews = () => API.get("/news");

// ML-powered personalized feed
export const fetchPersonalized = (userId) =>
  API.get(`/news/personalized/${userId}`);

// Click tracking (feeds ML ranking)
export const trackClick = (data) =>
  API.post("/news/click", data);

// ML trending
export const fetchTrending = () => API.get("/news/trending");

// ML semantic search
export const semanticSearchAPI = (query) =>
  API.get(`/news/semantic-search?q=${encodeURIComponent(query)}`);

// Keyword search (fallback)
export const searchNewsAPI = (query) =>
  API.get(`/news/search?q=${encodeURIComponent(query)}`);

// ML-based recommendations
export const fetchRecommendations = (articleId, userId) =>
  API.get(`/news/recommend/${articleId}?userId=${userId}`);

// ML service health
export const fetchMLStatus = () => API.get("/news/ml-status");