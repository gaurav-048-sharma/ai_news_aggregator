import React from "react";

const AIInsightsPanel = ({ userPreferences, articleCount, mlStatus, searchMode }) => {
  return (
    <div style={styles.panel}>
      <div style={styles.container}>
        {/* AI Status */}
        <div style={styles.chip}>
          <div style={{
            ...styles.iconCircle,
            background: "linear-gradient(135deg, #6c5ce7, #a29bfe)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div>
            <span style={styles.chipLabel}>AI Engine</span>
            <span style={styles.chipValue}>
              {searchMode ? "Semantic Search" : "Smart Ranking"}
            </span>
          </div>
        </div>

        {/* Articles Count */}
        <div style={styles.chip}>
          <div style={{
            ...styles.iconCircle,
            background: "linear-gradient(135deg, #00cec9, #0984e3)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M4 6h16M4 12h10M4 18h14" />
            </svg>
          </div>
          <div>
            <span style={styles.chipLabel}>Processed</span>
            <span style={styles.chipValue}>{articleCount} articles</span>
          </div>
        </div>

        {/* User Preferences */}
        {userPreferences && userPreferences.length > 0 && (
          <div style={styles.chip}>
            <div style={{
              ...styles.iconCircle,
              background: "linear-gradient(135deg, #fd79a8, #e17055)",
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <div>
              <span style={styles.chipLabel}>Your Interests</span>
              <span style={styles.chipValue}>
                {userPreferences.slice(0, 3).join(", ")}
                {userPreferences.length > 3 ? ` +${userPreferences.length - 3}` : ""}
              </span>
            </div>
          </div>
        )}

        {/* Model Info */}
        <div style={styles.chip}>
          <div style={{
            ...styles.iconCircle,
            background: "linear-gradient(135deg, #00b894, #55efc4)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
            </svg>
          </div>
          <div>
            <span style={styles.chipLabel}>ML Model</span>
            <span style={styles.chipValue}>MiniLM-L6-v2</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  panel: {
    padding: "12px 24px",
    borderBottom: "1px solid var(--border-subtle)",
    background: "rgba(108, 92, 231, 0.03)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    alignItems: "center",
  },
  chip: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "6px 14px 6px 6px",
    borderRadius: "var(--radius-pill)",
    background: "var(--bg-glass)",
    border: "1px solid var(--border-subtle)",
  },
  iconCircle: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  chipLabel: {
    display: "block",
    fontSize: "9px",
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  chipValue: {
    display: "block",
    fontSize: "12px",
    fontWeight: 600,
    color: "var(--text-primary)",
  },
};

export default AIInsightsPanel;
