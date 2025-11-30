from sqlalchemy import create_engine

from src.db.tables import *
from src.db.base import Base
from src.config import config

DATABASE_URL = config.sync_db_connection


def drop_tables():
    engine = create_engine(DATABASE_URL)
    Base.metadata.drop_all(engine)

def create_tables():
    engine = create_engine(DATABASE_URL)
    Base.metadata.create_all(engine)