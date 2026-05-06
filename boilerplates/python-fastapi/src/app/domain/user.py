from dataclasses import dataclass
from uuid import UUID, uuid4

from app.domain.role import Role
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username


@dataclass
class User:
    _id: UUID
    _username: Username
    _email: Email
    _hashed_password: str
    _role: Role

    def __post_init__(self) -> None:
        if not isinstance(self._id, UUID):
            raise ValueError("Invalid id")
        if not isinstance(self._username, Username):
            raise ValueError("Invalid username")
        if not isinstance(self._email, Email):
            raise ValueError("Invalid email")
        if not isinstance(self._role, Role):
            raise ValueError("Invalid role")

    @property
    def id(self) -> UUID:
        return self._id

    @property
    def username(self) -> Username:
        return self._username

    @property
    def hashed_password(self) -> str:
        return self._hashed_password

    @property
    def email(self) -> Email:
        return self._email

    @property
    def role(self) -> Role:
        return self._role

    @classmethod
    def create(
        cls, username: Username, email: Email, hashed_password: str, role: Role
    ) -> "User":
        return cls(
            _id=uuid4(),
            _username=username,
            _email=email,
            _hashed_password=hashed_password,
            _role=role,
        )

    @classmethod
    def reconstitute(
        cls,
        *,
        id: UUID,
        username: Username,
        email: Email,
        hashed_password: str,
        role: Role,
    ) -> "User":
        return cls(
            _id=id,
            _username=username,
            _email=email,
            _hashed_password=hashed_password,
            _role=role,
        )

    def is_admin(self) -> bool:
        return self.role == Role.ADMIN

    def is_user(self) -> bool:
        return self.role == Role.USER

    def change_username(self, username: Username) -> None:
        self._username = username

    def change_email(self, email: Email) -> None:
        self._email = email

    def change_password(self, hashed_password: str) -> None:
        if not hashed_password:
            raise ValueError("Invalid password")
        self._hashed_password = hashed_password

    def promote_to_admin(self) -> None:
        self._role = Role.ADMIN

    def demote_to_user(self) -> None:
        self._role = Role.USER
