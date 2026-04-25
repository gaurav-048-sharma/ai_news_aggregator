import joblib
from sklearn.metrics.pairwise import cosine_similarity

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

def predict_category(text):
    X = vectorizer.transform([text])
    return model.predict(X)[0]


def find_similar(query, texts):
    X = vectorizer.transform(texts + [query])
    similarities = cosine_similarity(X[-1], X[:-1])
    return similarities[0]    

# test
if __name__ == "__main__":
    print(predict_category("New AI breakthrough by Google"))