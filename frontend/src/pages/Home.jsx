import React, { useEffect, useState, useCallback } from "react";
import {
  fetchPersonalized,
  trackClick,
  fetchTrending,
  semanticSearchAPI,
  fetchMLStatus,
  fetchNews,
} from "../services/api";
import NewsCard from "../components/NewsCard";
import Navbar from "../components/Navbar";
import CategoryFilter from "../components/CategoryFilter";
import AIInsightsPanel from "../components/AIInsightsPanel";
import SkeletonLoader from "../components/SkeletonLoader";

const USER_ID = "rohan123";

const Home = () => {
  const [news, setNews] = useState([]);
  const [trending, setTrending] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [mlStatus, setMlStatus] = useState("unknown");
  const [userPreferences, setUserPreferences] = useState([]);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Initial load
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    setLoading(true);
    setTrendingLoading(true);

    try {
      // Check ML status
      const statusRes = await fetchMLStatus();
      setMlStatus(statusRes.data?.mlService?.status || "offline");
    } catch {
      setMlStatus("offline");
    }

    // Fetch initial news (triggers ML classification)
    try {
      await fetchNews();
    } catch (e) {
      console.error("Initial fetch error:", e.message);
    }

    // Load personalized feed + trending
    await loadAll();
  };

  const loadAll = async () => {
    try {
      setLoading(true);
      setTrendingLoading(true);

      const [personalizedRes, trendingRes] = await Promise.all([
        fetchPersonalized(USER_ID),
        fetchTrending(),
      ]);

      setNews(personalizedRes.data.data || []);
      setUserPreferences(personalizedRes.data.userPreferences || []);
      setTrending(trendingRes.data.data || []);
    } catch (e) {
      console.error("Load error:", e.message);
    } finally {
      setLoading(false);
      setTrendingLoading(false);
    }
  };

  // Semantic search handler (triggers on button click or Enter)
  const handleSearch = useCallback(async (query) => {
    if (!query || query.trim() === "") {
      setIsSearchMode(false);
      setSearchQuery("");
      loadAll();
      return;
    }

    setIsSearchMode(true);
    setSearchQuery(query);
    setSearchLoading(true);

    try {
      const res = await semanticSearchAPI(query);
      setNews(res.data.data || []);
    } catch (e) {
      console.error("Search error:", e.message);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Track clicks (feeds ML ranking)
  const handleClick = async (articleId) => {
    try {
      const res = await trackClick({ userId: USER_ID, articleId });
      if (res.data.preferences) {
        setUserPreferences(res.data.preferences);
      }
    } catch (e) {
      console.error("Click tracking error:", e.message);
    }
  };

  // Clear search
  const clearSearch = () => {
    setSearch("");
    setIsSearchMode(false);
    setSearchQuery("");
    loadAll();
  };

  // Category filter
  const filteredNews = news.filter(
    (article) => category === "All" || article.category === category
  );

  return (
    <div style={styles.app}>
      <Navbar
        search={search}
        setSearch={setSearch}
        onSearch={handleSearch}
        mlStatus={mlStatus}
      />

      <CategoryFilter selected={category} setSelected={setCategory} />

      <AIInsightsPanel
        userPreferences={userPreferences}
        articleCount={filteredNews.length}
        mlStatus={mlStatus}
        searchMode={isSearchMode}
      />

      <main style={styles.main}>
        {/* Search Results Banner */}
        {isSearchMode && (
          <div style={styles.searchBanner}>
            <div style={styles.searchBannerContent}>
              <div style={styles.searchBannerLeft}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
                <div>
                  <span style={styles.searchBannerTitle}>
                    Semantic Search Results
                  </span>
                  <span style={styles.searchBannerDesc}>
                    Showing {filteredNews.length} results for "{searchQuery}" — powered by neural embeddings
                  </span>
                </div>
              </div>
              <button onClick={clearSearch} style={styles.clearButton}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
                Clear
              </button>
            </div>
          </div>
        )}

        {/* Trending Section (hide during search) */}
        {!isSearchMode && (
          <section style={styles.section}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionTitleGroup}>
                <div style={{
                  ...styles.sectionIcon,
                  background: "var(--gradient-warm)",
                }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                  </svg>
                </div>
                <div>
                  <h2 style={styles.sectionTitle}>Trending Now</h2>
                  <span style={styles.sectionSub}>Most engaged articles, ranked by ML</span>
                </div>
              </div>
            </div>

            {trendingLoading ? (
              <SkeletonLoader count={4} variant="horizontal" />
            ) : (
              <div style={styles.trendingScroller}>
                {trending.map((article, i) => (
                  <NewsCard
                    key={article._id}
                    article={article}
                    onClick={() => handleClick(article._id)}
                    animationDelay={i * 100}
                    variant="trending"
                  />
                ))}
                {trending.length === 0 && (
                  <div style={styles.emptyState}>
                    <span style={styles.emptyIcon}>📊</span>
                    <span>No trending articles yet. Click some articles to build engagement data!</span>
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {/* Main Feed */}
        <section style={styles.section}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionTitleGroup}>
              <div style={{
                ...styles.sectionIcon,
                background: isSearchMode
                  ? "var(--gradient-cool)"
                  : "var(--gradient-primary)",
              }}>
                {isSearchMode ? (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.35-4.35" />
                  </svg>
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                )}
              </div>
              <div>
                <h2 style={styles.sectionTitle}>
                  {isSearchMode ? "Search Results" : "Your Smart Feed"}
                </h2>
                <span style={styles.sectionSub}>
                  {isSearchMode
                    ? "Ranked by semantic similarity using neural embeddings"
                    : "Personalized with ML — adapts to your reading patterns"}
                </span>
              </div>
            </div>

            <div style={styles.feedStats}>
              <span style={styles.feedStatBadge}>
                {filteredNews.length} articles
              </span>
              {category !== "All" && (
                <span style={{
                  ...styles.feedStatBadge,
                  background: "rgba(108, 92, 231, 0.15)",
                  color: "var(--accent-secondary)",
                }}>
                  {category}
                </span>
              )}
            </div>
          </div>

          {loading || searchLoading ? (
            <SkeletonLoader count={8} variant="grid" />
          ) : filteredNews.length > 0 ? (
            <div style={styles.newsGrid}>
              {filteredNews.map((article, i) => (
                <NewsCard
                  key={article._id}
                  article={article}
                  onClick={() => handleClick(article._id)}
                  animationDelay={i * 80}
                />
              ))}
            </div>
          ) : (
            <div style={styles.emptyStateLarge}>
              <div style={styles.emptyIconLarge}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <h3 style={styles.emptyTitle}>No articles found</h3>
              <p style={styles.emptyText}>
                {isSearchMode
                  ? `No semantic matches for "${searchQuery}". Try different phrasing — semantic search understands meaning, not just keywords.`
                  : `No articles in the "${category}" category. Try selecting "All" or a different category.`}
              </p>
              {isSearchMode && (
                <button onClick={clearSearch} style={styles.emptyButton}>
                  Back to Feed
                </button>
              )}
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <span style={styles.footerText}>
            NeuralNews — Powered by Sentence Transformers, Scikit-learn, and Neural Embeddings
          </span>
          <div style={styles.footerBadges}>
            <span style={styles.footerBadge}>ML Classification</span>
            <span style={styles.footerBadge}>Semantic Search</span>
            <span style={styles.footerBadge}>Smart Ranking</span>
            <span style={styles.footerBadge}>Personalization</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
  },
  main: {
    flex: 1,
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    width: "100%",
  },
  section: {
    marginTop: "32px",
    marginBottom: "16px",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionTitleGroup: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  sectionIcon: {
    width: "36px",
    height: "36px",
    borderRadius: "var(--radius-md)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  sectionTitle: {
    fontSize: "20px",
    fontWeight: 800,
    color: "var(--text-primary)",
    lineHeight: 1.2,
  },
  sectionSub: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  feedStats: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
  },
  feedStatBadge: {
    fontSize: "11px",
    fontWeight: 600,
    padding: "4px 12px",
    borderRadius: "var(--radius-pill)",
    background: "var(--bg-glass)",
    border: "1px solid var(--border-subtle)",
    color: "var(--text-secondary)",
  },
  trendingScroller: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    paddingBottom: "12px",
    scrollSnapType: "x mandatory",
  },
  newsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  searchBanner: {
    marginTop: "24px",
    padding: "16px 20px",
    borderRadius: "var(--radius-lg)",
    background: "rgba(108, 92, 231, 0.08)",
    border: "1px solid rgba(108, 92, 231, 0.2)",
  },
  searchBannerContent: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  searchBannerLeft: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  searchBannerTitle: {
    display: "block",
    fontSize: "14px",
    fontWeight: 700,
    color: "var(--accent-secondary)",
  },
  searchBannerDesc: {
    display: "block",
    fontSize: "12px",
    color: "var(--text-muted)",
  },
  clearButton: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-glass)",
    color: "var(--text-secondary)",
    fontSize: "12px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "var(--transition-fast)",
  },
  emptyState: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "24px",
    color: "var(--text-muted)",
    fontSize: "14px",
  },
  emptyIcon: {
    fontSize: "24px",
  },
  emptyStateLarge: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 24px",
    textAlign: "center",
  },
  emptyIconLarge: {
    marginBottom: "16px",
    opacity: 0.5,
  },
  emptyTitle: {
    fontSize: "18px",
    fontWeight: 700,
    color: "var(--text-primary)",
    marginBottom: "8px",
  },
  emptyText: {
    fontSize: "14px",
    color: "var(--text-muted)",
    maxWidth: "400px",
    lineHeight: 1.6,
  },
  emptyButton: {
    marginTop: "20px",
    padding: "10px 24px",
    borderRadius: "var(--radius-pill)",
    background: "var(--gradient-primary)",
    border: "none",
    color: "white",
    fontSize: "14px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
  },
  footer: {
    marginTop: "60px",
    padding: "32px 24px",
    borderTop: "1px solid var(--border-subtle)",
    background: "var(--bg-secondary)",
  },
  footerContent: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
  },
  footerText: {
    fontSize: "12px",
    color: "var(--text-muted)",
    fontWeight: 500,
  },
  footerBadges: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  footerBadge: {
    fontSize: "10px",
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: "var(--radius-pill)",
    background: "rgba(108, 92, 231, 0.1)",
    border: "1px solid rgba(108, 92, 231, 0.2)",
    color: "var(--accent-secondary)",
    textTransform: "uppercase",
    letterSpacing: "0.3px",
  },
};

export default Home;