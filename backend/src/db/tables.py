import uuid
import datetime as dt

from sqlalchemy.orm import mapped_column
from sqlalchemy import text
from sqlalchemy import ForeignKey, String, Integer, Boolean
from sqlalchemy.orm import Mapped, relationship
from sqlalchemy import func

from src.db.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text('gen_random_uuid()')
    )
    login: Mapped[str]
    hash_password: Mapped[str]
    sentimental_reports: Mapped["SentimentalReport"] = relationship(back_populates="user",
                                                                    lazy="selectin",
                                                                    cascade="all, delete")

    created_at: Mapped[dt.datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )


class SentimentalReport(Base):
    __tablename__ = "sentimental_reports"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        server_default=text('gen_random_uuid()')
    )
    filepath: Mapped[str] = mapped_column(nullable=False)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    user: Mapped["User"] = relationship(back_populates="sentimental_reports", lazy="selectin")
    created_at: Mapped[dt.datetime] = mapped_column(server_default=func.now())
    updated_at: Mapped[dt.datetime] = mapped_column(
        server_default=func.now(), onupdate=func.now()
    )


