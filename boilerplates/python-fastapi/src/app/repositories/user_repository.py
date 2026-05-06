from abc import ABC, abstractmethod
from uuid import UUID

from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username


class UserRepository(ABC):
    @abstractmethod
    def create(self, user: User) -> None:
        pass

    @abstractmethod
    def save(self, user: User) -> None:
        pass

    @abstractmethod
    def get_by_id(self, user_id: UUID) -> User | None:
        pass

    @abstractmethod
    def get_by_email(self, email: Email) -> User | None:
        pass

    @abstractmethod
    def exists_by_email(self, email: Email) -> bool:
        pass

    @abstractmethod
    def exists_by_username(self, username: Username) -> bool:
        pass

    @abstractmethod
    def delete(self, user: User) -> None:
        pass
