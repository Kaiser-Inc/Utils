from abc import ABC, abstractmethod
from datetime import datetime
from uuid import UUID


class RefreshTokenRepository(ABC):
    @abstractmethod
    def save(self, user_id: UUID, token_hash: str, expires_at: datetime) -> None:
        pass

    @abstractmethod
    def exists(self, token_hash: str) -> bool:
        pass

    @abstractmethod
    def revoke(self, token_hash: str) -> None:
        pass

    @abstractmethod
    def revoke_all_for_user(self, user_id: UUID) -> None:
        pass
