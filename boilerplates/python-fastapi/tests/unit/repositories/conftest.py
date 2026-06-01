import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.repositories.sql_alchemy.models import (  # noqa: F401  (registra os modelos no metadata)
    refresh_token_model,
    user_model,
)
from app.repositories.sql_alchemy.models.base import Base


@pytest.fixture
def db_session() -> Session:
    """Sessão SQLite em memória com o schema dos modelos criado.

    StaticPool mantém a mesma conexão durante o teste, preservando o banco
    in-memory entre operações.
    """
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    session = sessionmaker(bind=engine)()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(engine)
