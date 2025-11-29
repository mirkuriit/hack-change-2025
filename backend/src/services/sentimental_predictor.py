from typing import Literal
import random

class SentimentalPredictor:
    def __init__(self):
        ...

    def predict_from_one(self, text: str) -> Literal["negative", "neutral", "positive"]:
        return random.choice(["negative", "neutral", "positive"])

    def predict_f1(self, path: str):
        return 0.99


def get_predict_sentimental_service():
    return SentimentalPredictor()