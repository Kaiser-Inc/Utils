from uuid import UUID

from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.user_repository import UserRepository


class InMemoryUserRepository(UserRepository):
    def __init__(self):
        self._users: list[User] = []

    def create(self, user: User) -> None:
        self._users.append(user)

    def save(self, user: User) -> None:
        for index, existing in enumerate(self._users):
            if existing.id == user.id:
                self._users[index] = user
                return
        raise ValueError("User not found")

    def get_by_email(self, email: Email) -> User | None:
        for user in self._users:
            if user.email == email:
                return user
        return None

    def get_by_id(self, user_id: UUID) -> User | None:
        for user in self._users:
            if user.id == user_id:
                return user
        return None

    def exists_by_username(self, username: Username) -> bool:
        return any(user.username == username for user in self._users)

    def exists_by_email(self, email: Email) -> bool:
        return any(user.email == email for user in self._users)

    def delete(self, user: User) -> None:
        self._users = [u for u in self._users if u.id != user.id]
