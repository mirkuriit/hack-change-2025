import uuid
import datetime as dt
from pydantic import BaseModel
from typing import Literal


class SentimentalReportBase(BaseModel):
    class Config:
        fron_attributes = True


class SentimentalReportCreate(SentimentalReportBase):
    user_id: uuid.UUID
    id: uuid.UUID


class SentimentalReportRead(SentimentalReportBase):
    id: uuid.UUID
    user_id: uuid.UUID
    created_at: dt.datetime


class SentimentPrediction(BaseModel):
    ID: int
    text: str
    src: str
    label: Literal[0, 1, 2]


class SentimentalReportReadPreds(SentimentalReportBase):
    id: uuid.UUID
    prediction: list[SentimentPrediction]

