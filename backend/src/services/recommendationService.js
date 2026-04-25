import natural from "natural";

const TfIdf = natural.TfIdf;

export const getRecommendations = (articles, targetIndex) => {
  const tfidf = new TfIdf();

  // Combine title + description
  articles.forEach(article => {
    tfidf.addDocument(
      (article.title || "") + " " + (article.description || "")
    );
  });

  const scores = [];

  // Compare target article with all others
  tfidf.tfidfs(
    (articles[targetIndex].title || "") +
      " " +
      (articles[targetIndex].description || ""),
    (i, measure) => {
      scores.push({ index: i, score: measure });
    }
  );

  // Sort by similarity
  scores.sort((a, b) => b.score - a.score);

  // Remove itself & take top 5
  return scores
    .filter(item => item.index !== targetIndex)
    .slice(0, 5)
    .map(item => articles[item.index]);
};