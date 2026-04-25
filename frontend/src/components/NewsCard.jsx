import React, { useState } from "react";

const CATEGORY_COLORS = {
  Technology: { bg: "rgba(9, 132, 227, 0.15)", color: "#74b9ff", border: "rgba(9, 132, 227, 0.3)" },
  Business: { bg: "rgba(0, 184, 148, 0.15)", color: "#55efc4", border: "rgba(0, 184, 148, 0.3)" },
  Sports: { bg: "rgba(225, 112, 85, 0.15)", color: "#fab1a0", border: "rgba(225, 112, 85, 0.3)" },
  Politics: { bg: "rgba(214, 48, 49, 0.15)", color: "#ff7675", border: "rgba(214, 48, 49, 0.3)" },
  Health: { bg: "rgba(0, 184, 148, 0.15)", color: "#55efc4", border: "rgba(0, 184, 148, 0.3)" },
  Entertainment: { bg: "rgba(232, 67, 147, 0.15)", color: "#fd79a8", border: "rgba(232, 67, 147, 0.3)" },
  Science: { bg: "rgba(108, 92, 231, 0.15)", color: "#a29bfe", border: "rgba(108, 92, 231, 0.3)" },
  Education: { bg: "rgba(253, 203, 110, 0.15)", color: "#fdcb6e", border: "rgba(253, 203, 110, 0.3)" },
  General: { bg: "rgba(99, 110, 114, 0.15)", color: "#b2bec3", border: "rgba(99, 110, 114, 0.3)" },
};

const NewsCard = ({ article, onClick, animationDelay = 0, variant = "default" }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const category = article.category || "General";
  const catColor = CATEGORY_COLORS[category] || CATEGORY_COLORS.General;

  // Determine which score to show
  const score = article.ml_score || article.score || article.recommendation_score || article.similarity_score || null;
  const confidence = article.categoryConfidence || article.confidence || null;
  const explanation = article.explanation || article.reason || null;

  // Score color based on value
  const getScoreColor = (s) => {
    if (s > 0.7) return "#00b894";
    if (s > 0.4) return "#fdcb6e";
    return "#e17055";
  };

  const isTrending = article.isTrending || variant === "trending";

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...styles.card,
        ...(hovered ? styles.cardHover : {}),
        animationDelay: `${animationDelay}ms`,
        ...(isTrending ? styles.trendingCard : {}),
      }}
    >
      {/* Trending Badge */}
      {article.trendingRank && (
        <div style={{
          ...styles.trendingBadge,
          background: article.trendingRank === 1
            ? "var(--gradient-gold)"
            : article.trendingRank <= 3
              ? "var(--gradient-warm)"
              : "var(--gradient-cool)",
        }}>
          <span style={{ fontSize: "10px", fontWeight: 800 }}>#{article.trendingRank}</span>
          <span style={{ fontSize: "9px", fontWeight: 600 }}>{article.trendLabel || "Trending"}</span>
        </div>
      )}

      {/* Image */}
      <div style={styles.imageContainer}>
        {!imgError && article.image ? (
          <img
            src={article.image}
            alt={article.title || ""}
            style={{
              ...styles.image,
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={styles.imagePlaceholder}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* AI Score Overlay */}
        {score !== null && (
          <div style={{
            ...styles.scoreOverlay,
            borderColor: getScoreColor(score),
          }}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill={getScoreColor(score)} stroke="none">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
            <span style={{ color: getScoreColor(score) }}>
              {(score * 100).toFixed(0)}%
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Category + Confidence */}
        <div style={styles.metaRow}>
          <span style={{
            ...styles.categoryBadge,
            background: catColor.bg,
            color: catColor.color,
            borderColor: catColor.border,
          }}>
            {category}
            {confidence ? (
              <span style={styles.confidenceLabel}>
                {(confidence * 100).toFixed(0)}%
              </span>
            ) : null}
          </span>

          {article.clicks > 0 && (
            <span style={styles.clickCount}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              {article.clicks}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 style={{
          ...styles.title,
          color: hovered ? "var(--accent-secondary)" : "var(--text-primary)",
        }}>
          {article.title}
        </h3>

        {/* Description */}
        {article.description && (
          <p style={styles.description}>
            {article.description.length > 120
              ? article.description.slice(0, 120) + "..."
              : article.description}
          </p>
        )}

        {/* AI Explanation */}
        {explanation && (
          <div style={styles.explanation}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--accent-secondary)" strokeWidth="2">
              <path d="M12 2a7 7 0 017 7c0 3-2 5-3.5 6.5L12 19l-3.5-3.5C7 14 5 12 5 9a7 7 0 017-7z" />
              <circle cx="12" cy="9" r="1" fill="var(--accent-secondary)" />
            </svg>
            <span>{explanation}</span>
          </div>
        )}

        {/* Footer */}
        <div style={styles.footer}>
          <span style={styles.source}>{article.source || "Unknown"}</span>
          <span style={styles.date}>
            {article.publishedAt
              ? new Date(article.publishedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : ""}
          </span>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
    overflow: "hidden",
    cursor: "pointer",
    transition: "var(--transition-normal)",
    position: "relative",
    animation: "fadeInUp 0.5s ease forwards",
    opacity: 0,
  },
  cardHover: {
    borderColor: "var(--border-accent)",
    transform: "translateY(-4px)",
    boxShadow: "var(--shadow-hover)",
  },
  trendingCard: {
    minWidth: "300px",
    maxWidth: "350px",
    flexShrink: 0,
  },
  trendingBadge: {
    position: "absolute",
    top: "12px",
    left: "12px",
    zIndex: 10,
    padding: "4px 10px",
    borderRadius: "var(--radius-pill)",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    color: "white",
    backdropFilter: "blur(8px)",
  },
  imageContainer: {
    position: "relative",
    overflow: "hidden",
    height: "180px",
  },
  image: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    transition: "var(--transition-normal)",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "var(--bg-tertiary)",
  },
  scoreOverlay: {
    position: "absolute",
    top: "12px",
    right: "12px",
    background: "rgba(10, 10, 15, 0.85)",
    backdropFilter: "blur(8px)",
    border: "1px solid",
    borderRadius: "var(--radius-sm)",
    padding: "4px 8px",
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    fontWeight: 700,
    animation: "scoreGlow 3s ease-in-out infinite",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  metaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "8px",
  },
  categoryBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "3px 10px",
    borderRadius: "var(--radius-pill)",
    fontSize: "11px",
    fontWeight: 600,
    border: "1px solid",
    letterSpacing: "0.3px",
  },
  confidenceLabel: {
    opacity: 0.7,
    fontSize: "9px",
    fontWeight: 700,
  },
  clickCount: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    fontSize: "11px",
    color: "var(--text-muted)",
  },
  title: {
    fontSize: "15px",
    fontWeight: 700,
    lineHeight: 1.4,
    transition: "var(--transition-fast)",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    overflow: "hidden",
  },
  description: {
    fontSize: "13px",
    color: "var(--text-secondary)",
    lineHeight: 1.5,
  },
  explanation: {
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    padding: "8px 10px",
    borderRadius: "var(--radius-sm)",
    background: "rgba(108, 92, 231, 0.08)",
    border: "1px solid rgba(108, 92, 231, 0.15)",
    fontSize: "11px",
    color: "var(--accent-secondary)",
    fontWeight: 500,
    lineHeight: 1.4,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: "8px",
    borderTop: "1px solid var(--border-subtle)",
  },
  source: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontWeight: 600,
  },
  date: {
    fontSize: "11px",
    color: "var(--text-muted)",
  },
};

export default NewsCard;