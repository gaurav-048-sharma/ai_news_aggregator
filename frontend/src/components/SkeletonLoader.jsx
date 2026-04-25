import React from "react";

const SkeletonCard = () => (
  <div style={styles.card}>
    <div style={{ ...styles.skeleton, height: "180px", borderRadius: "0" }} />
    <div style={styles.content}>
      <div style={styles.row}>
        <div style={{ ...styles.skeleton, width: "80px", height: "22px", borderRadius: "999px" }} />
        <div style={{ ...styles.skeleton, width: "40px", height: "16px" }} />
      </div>
      <div style={{ ...styles.skeleton, width: "100%", height: "18px" }} />
      <div style={{ ...styles.skeleton, width: "85%", height: "18px" }} />
      <div style={{ ...styles.skeleton, width: "100%", height: "40px" }} />
      <div style={styles.row}>
        <div style={{ ...styles.skeleton, width: "60px", height: "14px" }} />
        <div style={{ ...styles.skeleton, width: "70px", height: "14px" }} />
      </div>
    </div>
  </div>
);

const SkeletonLoader = ({ count = 8, variant = "grid" }) => {
  if (variant === "horizontal") {
    return (
      <div style={styles.horizontalContainer}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} style={{ minWidth: "300px", maxWidth: "350px", flexShrink: 0 }}>
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div style={styles.gridContainer}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
};

const styles = {
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: "20px",
  },
  horizontalContainer: {
    display: "flex",
    gap: "16px",
    overflowX: "auto",
    padding: "4px",
  },
  card: {
    background: "var(--bg-card)",
    borderRadius: "var(--radius-lg)",
    border: "1px solid var(--border-subtle)",
    overflow: "hidden",
  },
  content: {
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  row: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeleton: {
    background: "linear-gradient(90deg, var(--bg-tertiary) 25%, rgba(255, 255, 255, 0.05) 50%, var(--bg-tertiary) 75%)",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.5s infinite",
    borderRadius: "var(--radius-sm)",
  },
};

export default SkeletonLoader;
