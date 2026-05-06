from app.core.security import hash_password
from app.domain.role import Role
from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.user_repository import UserRepository


class RegisterUserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def execute(self, username: str, email: str, password: str, role: Role) -> User:

        username_vo = Username(username)
        email_vo = Email(email)

        if self.user_repository.exists_by_email(email_vo):
            raise ValueError("Email already in use!")

        if self.user_repository.exists_by_username(username_vo):
            raise ValueError("Username already taken")

        hashed_password = hash_password(password)

        user = User.create(
            username=username_vo,
            email=email_vo,
            hashed_password=hashed_password,
            role=role,
        )

        self.user_repository.create(user)

        return user
