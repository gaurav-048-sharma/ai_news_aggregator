import axios from "axios";

const BASE_URL = "https://newsapi.org/v2";

export const fetchTopHeadlines = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/top-headlines`, {
      params: {
        country: "us",
        apiKey: process.env.NEWS_API_KEY,
      },
    });

    return response.data.articles;
  } catch (error) {
    console.error("Error fetching news:", error.message);
    throw error;
  }
};