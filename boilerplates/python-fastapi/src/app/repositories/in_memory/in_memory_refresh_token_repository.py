from datetime import datetime
from uuid import UUID

from app.repositories.refresh_token_repository import RefreshTokenRepository


class InMemoryRefreshTokenRepository(RefreshTokenRepository):
    def __init__(self):
        self._tokens: list[dict] = []

    def save(self, user_id: UUID, token_hash: str, expires_at: datetime) -> None:
        self._tokens.append(
            {
                "user_id": user_id,
                "token_hash": token_hash,
                "expires_at": expires_at,
            }
        )

    def exists(self, token_hash: str) -> bool:
        now = datetime.utcnow()
        return any(
            t["token_hash"] == token_hash and t["expires_at"] > now
            for t in self._tokens
        )

    def revoke(self, token_hash: str) -> None:
        self._tokens = [t for t in self._tokens if t["token_hash"] != token_hash]

    def revoke_all_for_user(self, user_id: UUID) -> None:
        self._tokens = [t for t in self._tokens if t["user_id"] != user_id]
