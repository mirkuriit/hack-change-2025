import uuid

from typing import Literal
from pydantic import BaseModel


class BaseSentimental(BaseModel):
    class Config:
        from_attributes = True


class SentimentalCreateFromOne(BaseSentimental):
    text: str


class SentimentalGet(BaseSentimental):
    predicted_mark: Literal["negative", "neutral", "positive"]
    text: str


class SentimentalCalculatedF1Get(BaseSentimental):
    f1: float

