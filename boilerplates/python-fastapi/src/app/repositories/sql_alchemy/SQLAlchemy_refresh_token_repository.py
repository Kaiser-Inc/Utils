from datetime import datetime
from uuid import UUID

from sqlalchemy.orm import Session

from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.sql_alchemy.models.refresh_token_model import RefreshTokenModel


class SQLAlchemyRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self, session: Session):
        self.session = session

    def save(self, user_id: UUID, token_hash: str, expires_at: datetime) -> None:
        token = RefreshTokenModel(
            user_id=user_id, token_hash=token_hash, expires_at=expires_at
        )
        self.session.add(token)
        self.session.commit()

    def exists(self, token_hash: str) -> bool:
        now = datetime.utcnow()
        return (
            self.session.query(RefreshTokenModel)
            .filter(
                RefreshTokenModel.token_hash == token_hash,
                RefreshTokenModel.expires_at > now,
            )
            .first()
            is not None
        )

    def revoke(self, token_hash: str) -> None:
        (
            self.session.query(RefreshTokenModel)
            .filter(RefreshTokenModel.token_hash == token_hash)
            .delete()
        )
        self.session.commit()

    def revoke_all_for_user(self, user_id: UUID) -> None:
        (
            self.session.query(RefreshTokenModel)
            .filter(RefreshTokenModel.user_id == user_id)
            .delete()
        )
        self.session.commit()
