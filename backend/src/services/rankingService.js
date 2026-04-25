export const rankNews = (articles, userPreferences = []) => {
  return articles.map(article => {
    // Preference score
    const preferenceScore = userPreferences.includes(article.category)
      ? 5
      : 1;

    // Recency score
    const hoursAgo =
      (Date.now() - new Date(article.publishedAt)) / (1000 * 60 * 60);

    const recencyScore = 1 / (hoursAgo + 1);

    // Popularity score
    const popularityScore = article.clicks || 0;

    const totalScore =
      preferenceScore + recencyScore + popularityScore;

    return {
      ...article._doc,
      score: totalScore,
    };
  })
  .sort((a, b) => b.score - a.score);
};