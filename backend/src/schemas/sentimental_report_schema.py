import uuid
import datetime as dt
from pydantic import BaseModel


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


class SentimentalReportReadPreds(SentimentalReportBase):
    id: uuid.UUID
    prediction: dict[str, list]

