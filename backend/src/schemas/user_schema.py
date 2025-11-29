import uuid
from pydantic import BaseModel

from src.schemas.sentimental_report_schema import SentimentalReportBase


class UserCreate(BaseModel):
    login: str
    password: str


class UserReadWithReport(BaseModel):
    id: uuid.UUID
    login: str
    sentimental_report: SentimentalReportBase

    class Config:
        orm_mode = True


class UserRead(BaseModel):
    id: uuid.UUID
    login: str

    class Config:
        orm_mode = True
