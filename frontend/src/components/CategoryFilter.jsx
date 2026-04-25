import React from "react";

const categories = [
  { name: "All", icon: "✦", gradient: "linear-gradient(135deg, #6c5ce7, #a29bfe)" },
  { name: "Technology", icon: "⚡", gradient: "linear-gradient(135deg, #0984e3, #00cec9)" },
  { name: "Business", icon: "📊", gradient: "linear-gradient(135deg, #00b894, #55efc4)" },
  { name: "Sports", icon: "🏆", gradient: "linear-gradient(135deg, #e17055, #fdcb6e)" },
  { name: "Politics", icon: "🏛", gradient: "linear-gradient(135deg, #d63031, #fd79a8)" },
  { name: "Health", icon: "💚", gradient: "linear-gradient(135deg, #00b894, #00cec9)" },
  { name: "Entertainment", icon: "🎬", gradient: "linear-gradient(135deg, #e84393, #fd79a8)" },
  { name: "Science", icon: "🔬", gradient: "linear-gradient(135deg, #6c5ce7, #74b9ff)" },
  { name: "Education", icon: "📚", gradient: "linear-gradient(135deg, #fdcb6e, #e17055)" },
];

const CategoryFilter = ({ selected, setSelected }) => {
  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <span style={styles.label}>Filter by AI Category</span>
        <div style={styles.pills}>
          {categories.map((cat) => {
            const isActive = selected === cat.name;
            return (
              <button
                key={cat.name}
                id={`category-filter-${cat.name.toLowerCase()}`}
                onClick={() => setSelected(cat.name)}
                style={{
                  ...styles.pill,
                  ...(isActive ? {
                    background: cat.gradient,
                    color: "white",
                    borderColor: "transparent",
                    boxShadow: "0 2px 12px rgba(108, 92, 231, 0.3)",
                  } : {}),
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.target.style.borderColor = "var(--accent-primary)";
                    e.target.style.background = "rgba(108, 92, 231, 0.1)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.target.style.borderColor = "var(--border-subtle)";
                    e.target.style.background = "var(--bg-glass)";
                  }
                }}
              >
                <span style={{ fontSize: "14px" }}>{cat.icon}</span>
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const styles = {
  wrapper: {
    padding: "16px 24px",
    borderBottom: "1px solid var(--border-subtle)",
  },
  container: {
    maxWidth: "1400px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    flexWrap: "wrap",
  },
  label: {
    fontSize: "11px",
    fontWeight: 600,
    color: "var(--text-muted)",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
    whiteSpace: "nowrap",
  },
  pills: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  pill: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    padding: "6px 14px",
    borderRadius: "var(--radius-pill)",
    border: "1px solid var(--border-subtle)",
    background: "var(--bg-glass)",
    color: "var(--text-secondary)",
    fontSize: "13px",
    fontWeight: 500,
    fontFamily: "inherit",
    cursor: "pointer",
    transition: "var(--transition-fast)",
    whiteSpace: "nowrap",
  },
};

export default CategoryFilter;