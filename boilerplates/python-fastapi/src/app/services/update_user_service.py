from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.user_repository import UserRepository


class UpdateUserService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def execute(self, user: User, username: str | None, email: str | None) -> User:

        if username and username != user.username.value:
            username_vo = Username(username)
            if self.user_repository.exists_by_username(username_vo):
                raise ValueError("Username already taken")
            user.change_username(Username(username))

        if email and email != user.email.value:
            email_vo = Email(email)
            if self.user_repository.exists_by_email(email_vo):
                raise ValueError("Email already in use!")
            user.change_email(Email(email))

        self.user_repository.save(user)
        return user
