from sqlmodel import SQLModel

from db.session import engine
from models.User import User  # noqa: F401


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
