import uuid
from pydantic import BaseModel


class SentimentalReportBase(BaseModel):
    filepath: str

class SentimentalReportCreate(BaseModel):
    filepath: str
    user_id: uuid.UUID


class SentimentalReportRead(BaseModel):
    id: uuid.UUID
    filepath: str
    user_id: uuid.UUID

    class Config:
        orm_mode = True
