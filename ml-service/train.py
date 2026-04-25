import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
import joblib

# Load expanded dataset
data = pd.read_csv("dataset.csv")

print(f"Dataset: {len(data)} samples across {data['category'].nunique()} categories")
print(f"Categories: {data['category'].unique().tolist()}")

X = data["text"]
y = data["category"]

# Convert text -> TF-IDF features
vectorizer = TfidfVectorizer(
    ngram_range=(1, 2),
    max_features=5000,
    stop_words="english",
)
X_vec = vectorizer.fit_transform(X)

# Train model with regularization
model = LogisticRegression(
    max_iter=1000,
    C=1.0,
    multi_class="multinomial",
    solver="lbfgs",
)
model.fit(X_vec, y)

# Evaluate with cross-validation
scores = cross_val_score(model, X_vec, y, cv=min(3, len(data)), scoring="accuracy")
print(f"Cross-validation accuracy: {scores.mean():.2%} (+/- {scores.std():.2%})")

# Save model artifacts
joblib.dump(model, "model.pkl")
joblib.dump(vectorizer, "vectorizer.pkl")

print("Model and vectorizer saved!")
print("Training complete!")