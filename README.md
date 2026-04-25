<p align="center">
  <img src="https://img.shields.io/badge/AI%20Powered-NeuralNews-6c5ce7?style=for-the-badge&labelColor=0a0a0f" alt="NeuralNews" />
  <img src="https://img.shields.io/badge/Status-Active-00b894?style=for-the-badge&labelColor=0a0a0f" alt="Active" />
  <img src="https://img.shields.io/badge/License-MIT-a29bfe?style=for-the-badge&labelColor=0a0a0f" alt="MIT" />
</p>

# NeuralNews — AI-Powered News Aggregator

An intelligent, full-stack news aggregation platform that uses **Machine Learning** at every layer — from how articles are classified and ranked, to how search results are returned, to how the UI communicates relevance back to the user. Think of it as a miniature, self-hosted Google News where ML is not just a backend detail but a clearly visible part of the user experience.

---

## Project Overview

NeuralNews is built as a **three-tier architecture** — a React frontend, a Node.js/Express backend, and a dedicated Python ML microservice — each with a distinct responsibility:

1. **Frontend** — A dark-themed, premium interface that surfaces ML outputs directly: AI relevance scores on every card, confidence-backed category badges, personalized explanations like *"Matches your interest in Technology"*, and a dedicated semantic search bar.

2. **Backend** — An Express API server that orchestrates data flow between the news source (NewsAPI), the database (MongoDB), and the ML service. It handles user interaction tracking, preference learning, and routes every major operation through the ML pipeline.

3. **ML Service** — A FastAPI microservice running Sentence Transformers for semantic understanding and Scikit-learn for text classification. It exposes endpoints for classification, semantic search, smart ranking, and content-based recommendations.

The system learns from each click — every article you interact with updates your preference profile, which feeds back into how the next batch of articles is ranked and recommended.

---

## Features

| Feature                     | Description                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Semantic Search**         | Search by meaning, not keywords. Queries like *"climate impact"* find articles about pollution, deforestation, and environmental policy. |
| **ML Classification**       | Every article is auto-classified into one of 8 categories (Technology, Business, Sports, Politics, Health, Entertainment, Science, Education) with a confidence score. |
| **Smart Ranking**           | The personalized feed is scored using a weighted ML formula combining user interest similarity, category preference, recency, and popularity. |
| **Content Recommendations** | Embedding-based similarity finds articles that are topically related to what you're reading.          |
| **Personalized Feed**       | Adapts in real time as you click articles — your category preferences and interaction history shape the ranking. |
| **Trending Detection**      | Articles are sorted by engagement (clicks) and recency with rank labels: *Top Story*, *Hot*, *Trending*. |
| **AI-Visible UI**           | Relevance scores, category confidence percentages, and recommendation reasons are shown directly on every news card. |
| **ML Status Indicator**     | A live status badge in the navbar shows whether the ML service is online.                             |

---

## Tech Stack

### Frontend

| Technology        | Role                                                                                     |
| ----------------- | ---------------------------------------------------------------------------------------- |
| **React 19**      | Component-based UI library for building the interactive single-page application.          |
| **Vite 8**        | Lightning-fast build tool and development server with hot module replacement.             |
| **Tailwind CSS 4**| Utility-first CSS framework used alongside CSS custom properties for the design system.   |
| **Axios**         | Promise-based HTTP client for making API requests from the browser to the backend.        |

### Backend

| Technology      | Role                                                                                       |
| --------------- | ------------------------------------------------------------------------------------------ |
| **Node.js**     | JavaScript runtime powering the server-side application logic.                             |
| **Express 5**   | Minimal web framework for defining REST API routes and middleware.                          |
| **MongoDB**     | NoSQL document database storing articles, user profiles, and interaction history.           |
| **Mongoose 9**  | ODM (Object Data Modeling) library for MongoDB schema definitions and queries.              |
| **Axios**       | Used server-side to communicate with the Python ML microservice over HTTP.                 |
| **dotenv**      | Loads environment variables (API keys, database URI) from a `.env` file.                   |
| **CORS**        | Middleware enabling cross-origin requests between the frontend and backend.                 |
| **Nodemon**     | Development utility that auto-restarts the server on file changes.                         |

### ML Service

| Technology                | Role                                                                                 |
| ------------------------- | ------------------------------------------------------------------------------------ |
| **Python 3**              | Core language for all machine learning logic and data processing.                    |
| **FastAPI**               | High-performance async web framework serving the ML model endpoints.                 |
| **Sentence Transformers** | Provides the `all-MiniLM-L6-v2` model for generating semantic embeddings of text.    |
| **Scikit-learn**          | Powers the TF-IDF vectorizer, Logistic Regression classifier, and cosine similarity. |
| **Joblib**                | Serializes and loads trained model artifacts (`model.pkl`, `vectorizer.pkl`).         |
| **Pydantic**              | Enforces request/response data validation and schema definitions in FastAPI.         |
| **Uvicorn**               | ASGI server that runs the FastAPI application with hot-reload support.                |

### External Services

| Service       | Role                                                                |
| ------------- | ------------------------------------------------------------------- |
| **NewsAPI**   | External REST API providing real-time top headlines from US sources. |
| **MongoDB Atlas** | Cloud-hosted MongoDB cluster for persistent data storage.       |

---

## Project Structure

```
ai-news-aggregator/
│
├── backend/                        # Node.js + Express API server
│   ├── src/
│   │   ├── app.js                  # Express app entry point
│   │   ├── config/
│   │   │   └── db.js               # MongoDB connection setup
│   │   ├── controllers/
│   │   │   └── newsController.js   # Route handlers — fetch, search, rank, recommend, track
│   │   ├── models/
│   │   │   ├── News.js             # Article schema (category, confidence, clicks, aiScore)
│   │   │   └── User.js             # User schema (preferences, interaction history, click counts)
│   │   ├── routes/
│   │   │   └── newsRoutes.js       # API route definitions
│   │   └── services/
│   │       ├── mlService.js        # ML microservice HTTP client
│   │       ├── newsService.js      # NewsAPI integration
│   │       ├── rankingService.js   # Fallback ranking logic
│   │       └── recommendationService.js  # TF-IDF based recommendations
│   ├── .env                        # Environment variables (API keys, DB URI)
│   └── package.json
│
├── frontend/                       # React + Vite SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Glassmorphism navbar with semantic search bar
│   │   │   ├── NewsCard.jsx        # Article card with AI scores, badges, explanations
│   │   │   ├── CategoryFilter.jsx  # ML category filter pills
│   │   │   ├── AIInsightsPanel.jsx # Real-time ML status dashboard
│   │   │   └── SkeletonLoader.jsx  # Loading state placeholders
│   │   ├── pages/
│   │   │   └── Home.jsx            # Main page — trending, feed, search orchestration
│   │   ├── services/
│   │   │   └── api.js              # Axios API client for all backend endpoints
│   │   ├── index.css               # Design system (CSS custom properties, animations)
│   │   ├── App.jsx                 # Root component
│   │   └── main.jsx                # React DOM entry point
│   ├── index.html                  # HTML shell with SEO meta and Google Fonts
│   └── package.json
│
├── ml-service/                     # Python + FastAPI ML microservice
│   ├── app.py                      # Unified ML service — 5 endpoints
│   ├── train.py                    # Model training script
│   ├── predict.py                  # Standalone prediction utilities
│   ├── main.py                     # Legacy classifier endpoint
│   ├── dataset.csv                 # Training data (99 samples, 8 categories)
│   ├── model.pkl                   # Trained Logistic Regression model
│   └── vectorizer.pkl              # Fitted TF-IDF vectorizer
│
└── README.md
```

---

## How the AI/ML Pipeline Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER INTERACTION                         │
│   Search query  ·  Click article  ·  Filter category  ·  Browse│
└──────────┬──────────────────────────────────────────────────────┘
           │
           ▼
┌──────────────────────┐       ┌──────────────────────────────────┐
│   React Frontend     │──────▶│   Express Backend                │
│                      │  API  │                                  │
│  • Renders AI scores │  calls│  • Fetches news from NewsAPI     │
│  • Shows explanations│◀──────│  • Sends articles to ML service  │
│  • Displays badges   │       │  • Stores results in MongoDB     │
│  • Tracks user clicks│       │  • Manages user preference model │
└──────────────────────┘       └─────────────┬────────────────────┘
                                             │
                                             ▼
                               ┌──────────────────────────────────┐
                               │   Python ML Service              │
                               │                                  │
                               │  /batch-classify                 │
                               │    → TF-IDF + LogReg → category  │
                               │                                  │
                               │  /semantic-search                │
                               │    → Sentence Transformer        │
                               │    → Cosine similarity → ranked  │
                               │                                  │
                               │  /smart-rank                     │
                               │    → User interest embedding     │
                               │    → Category + recency +        │
                               │      popularity → composite score│
                               │                                  │
                               │  /recommend                      │
                               │    → Article embeddings          │
                               │    → Content similarity → top N  │
                               └──────────────────────────────────┘
```

**Step by step:**

1. **Ingestion** — The backend fetches headlines from NewsAPI, sends all titles to the ML service for batch classification, and stores the articles in MongoDB with their predicted category and confidence score.

2. **Personalized Feed** — When a user loads the app, their click history and category preferences are sent to the ML service's `/smart-rank` endpoint. The service computes a composite score for each article using semantic similarity to the user's interest profile, category match, recency decay, and popularity — then returns the articles sorted by that score.

3. **Semantic Search** — When the user searches, the query and all article texts are encoded into 384-dimensional vectors using the `all-MiniLM-L6-v2` Sentence Transformer. Cosine similarity between the query vector and each article vector determines relevance — so *"economic downturn"* finds articles about *"recession"* and *"market crash"* even without shared keywords.

4. **Click Tracking** — Every article click increments the article's engagement counter and updates the user's preference profile (category click counts and interaction history). This data feeds back into the ranking model on the next page load.

5. **Recommendations** — When you click an article, the backend requests content-based recommendations from the ML service. It computes embedding similarity between the target article and all others, boosts matches in the user's preferred categories, and returns the top results with a natural-language reason.

---

## Getting Started

### Prerequisites

- **Node.js** v18+
- **Python** 3.10+
- **MongoDB** (local or Atlas cluster)
- **NewsAPI key** — get one free at [newsapi.org](https://newsapi.org)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/ai-news-aggregator.git
cd ai-news-aggregator
```

**Backend:**
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
NEWS_API_KEY=your_newsapi_key_here
MONGO_URI=your_mongodb_connection_string
```

**Frontend:**
```bash
cd frontend
npm install
```

**ML Service:**
```bash
cd ml-service
pip install fastapi uvicorn sentence-transformers scikit-learn joblib pandas pydantic
python train.py      # Train the classifier on the dataset
```

### Running the Application

Open three terminals and start each service:

```bash
# Terminal 1 — ML Service (start first, needs to load the Sentence Transformer model)
cd ml-service
uvicorn app:app --reload --port 8000

# Terminal 2 — Backend
cd backend
npm run dev

# Terminal 3 — Frontend
cd frontend
npm run dev
```

The app will be available at **http://localhost:5173**

> **Note:** Start the ML service first — it takes a few seconds to download and load the Sentence Transformer model (~80MB on first run). The backend gracefully falls back to default values if the ML service is temporarily unavailable.

---

## API Endpoints

| Method | Endpoint                        | Description                                           |
| ------ | ------------------------------- | ----------------------------------------------------- |
| GET    | `/api/news`                     | Fetch headlines from NewsAPI, classify, and store.     |
| GET    | `/api/news/personalized/:userId`| Get ML-ranked personalized feed for a user.            |
| GET    | `/api/news/semantic-search?q=`  | Semantic search using Sentence Transformer embeddings. |
| GET    | `/api/news/trending`            | Get top articles ranked by engagement and recency.     |
| GET    | `/api/news/recommend/:id`       | Get ML-based article recommendations.                 |
| GET    | `/api/news/search?q=`           | Fallback keyword search using regex matching.          |
| POST   | `/api/news/click`               | Track a user click and update preferences.             |
| GET    | `/api/news/ml-status`           | Check if the ML microservice is online.                |
| GET    | `/api/health`                   | Backend health check.                                  |

---

## ML Service Endpoints

| Method | Endpoint             | Input                                | Output                                           |
| ------ | -------------------- | ------------------------------------ | ------------------------------------------------ |
| POST   | `/predict`           | `{ text }`                           | `{ category, confidence, all_scores }`           |
| POST   | `/batch-classify`    | `{ texts[] }`                        | `{ results[{ category, confidence }] }`          |
| POST   | `/semantic-search`   | `{ query, articles[] }`             | `{ results[{ ...article, score, explanation }] }`|
| POST   | `/smart-rank`        | `{ articles[], user_preferences[] }` | `{ results[{ ...article, ml_score, explanation }] }` |
| POST   | `/recommend`         | `{ target_article, articles[] }`    | `{ results[{ ...article, similarity_score, reason }] }` |
| GET    | `/health`            | —                                    | `{ status, models[] }`                           |

---

## Screenshots

The application features a dark-themed UI with visible AI/ML outputs:

- **Navbar** — Glassmorphism design with a semantic search bar, search button, and live ML status indicator.
- **Category Filter** — Gradient pills for 8 ML-detected categories.
- **AI Insights Panel** — Displays the active ML engine, processed article count, and learned user interests.
- **News Cards** — Each card shows the ML-classified category with confidence %, an AI relevance score, view count, and a natural-language explanation of why it was recommended.
- **Trending Section** — Horizontally scrollable carousel with rank badges (#1 Top Story, #2 Hot, etc.).
- **Skeleton Loading** — Shimmer animation placeholders while data loads.

