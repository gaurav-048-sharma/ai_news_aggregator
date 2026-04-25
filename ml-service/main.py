from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI()

model = joblib.load("model.pkl")
vectorizer = joblib.load("vectorizer.pkl")

class NewsInput(BaseModel):
    text: str

@app.post("/predict")
def predict(news: NewsInput):
    X = vectorizer.transform([news.text])
    prediction = model.predict(X)[0]

    return {"category": prediction}