from app.domain.user import User
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository


class DeleteUserService:
    def __init__(
        self,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
    ):
        self.user_repository = user_repository
        self.refresh_token_repository = refresh_token_repository

    def execute(self, user: User) -> None:
        self.refresh_token_repository.revoke_all_for_user(user.id)
        self.user_repository.delete(user)
