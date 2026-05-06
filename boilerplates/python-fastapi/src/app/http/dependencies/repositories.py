from fastapi import Depends
from sqlalchemy.orm import Session

from app.http.dependencies.database import get_db
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.sql_alchemy.SQLAlchemy_refresh_token_repository import (
    SQLAlchemyRefreshTokenRepository,
)
from app.repositories.sql_alchemy.SQLAlchemy_user_repository import (
    SQLAlchemyUserRepository,
)
from app.repositories.user_repository import UserRepository


def get_user_repository(db: Session = Depends(get_db)) -> UserRepository:
    return SQLAlchemyUserRepository(db)


def get_refresh_token_repository(
    db: Session = Depends(get_db),
) -> RefreshTokenRepository:
    return SQLAlchemyRefreshTokenRepository(db)
