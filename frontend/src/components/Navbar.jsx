import React, { useState } from "react";

const Navbar = ({ search, setSearch, onSearch, mlStatus }) => {
  const [focused, setFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(search);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (onSearch) onSearch(search);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <div style={styles.logoIcon}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="url(#logoGrad)" />
              <path
                d="M8 10h12M8 14h8M8 18h10"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="21" cy="7" r="4" fill="#00cec9" stroke="#0a0a0f" strokeWidth="1.5" />
              <defs>
                <linearGradient id="logoGrad" x1="0" y1="0" x2="28" y2="28">
                  <stop stopColor="#6c5ce7" />
                  <stop offset="1" stopColor="#a29bfe" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 style={styles.logoText}>NeuralNews</h1>
            <span style={styles.logoSub}>AI-Powered Intelligence</span>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSubmit} style={{
          ...styles.searchContainer,
          ...(focused ? styles.searchFocused : {}),
        }}>
          <svg style={styles.searchIcon} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            id="semantic-search-input"
            type="text"
            placeholder="Semantic search — type meaning, not just keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            style={styles.searchInput}
          />
          <button
            id="semantic-search-button"
            type="submit"
            style={styles.searchButton}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--accent-secondary)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--accent-primary)";
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Search
          </button>
        </form>

        {/* ML Status Indicator */}
        <div style={styles.statusSection}>
          <div style={{
            ...styles.statusDot,
            background: mlStatus === "ok" ? "#00b894" : "#e17055",
          }} />
          <span style={styles.statusText}>
            {mlStatus === "ok" ? "ML Active" : "ML Offline"}
          </span>
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    background: "rgba(10, 10, 15, 0.85)",
    backdropFilter: "blur(20px)",
    borderBottom: "1px solid var(--border-subtle)",
    position: "sticky",
    top: 0,
    zIndex: 100,
    padding: "12px 0",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    padding: "0 24px",
    display: "flex",
    alignItems: "center",
    gap: "24px",
  },
  logoSection: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    flexShrink: 0,
  },
  logoIcon: {
    display: "flex",
    alignItems: "center",
  },
  logoText: {
    fontSize: "18px",
    fontWeight: 800,
    background: "linear-gradient(135deg, #e8e8f0, #a29bfe)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1.2,
  },
  logoSub: {
    fontSize: "10px",
    color: "var(--text-muted)",
    fontWeight: 500,
    letterSpacing: "0.5px",
    textTransform: "uppercase",
  },
  searchContainer: {
    flex: 1,
    maxWidth: "600px",
    display: "flex",
    alignItems: "center",
    background: "var(--bg-tertiary)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
    padding: "4px 4px 4px 16px",
    transition: "var(--transition-normal)",
    gap: "8px",
  },
  searchFocused: {
    borderColor: "var(--accent-primary)",
    boxShadow: "var(--shadow-glow)",
  },
  searchIcon: {
    color: "var(--text-muted)",
    flexShrink: 0,
  },
  searchInput: {
    flex: 1,
    background: "none",
    border: "none",
    outline: "none",
    color: "var(--text-primary)",
    fontSize: "14px",
    fontFamily: "inherit",
    padding: "8px 0",
    minWidth: 0,
  },
  searchButton: {
    background: "var(--accent-primary)",
    border: "none",
    borderRadius: "var(--radius-md)",
    color: "white",
    padding: "8px 16px",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "inherit",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "var(--transition-fast)",
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  statusSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  statusDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    animation: "scoreGlow 2s ease-in-out infinite",
  },
  statusText: {
    fontSize: "11px",
    color: "var(--text-muted)",
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    whiteSpace: "nowrap",
  },
};

export default Navbar;