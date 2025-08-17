from sqlmodel import create_engine, Session

from core.config import settings


engine = create_engine(str(settings.DATABASE_URL))


def get_session():
    with Session(engine) as session:
        yield session
