from fastapi import Depends

from app.domain.user import User
from app.http.dependencies.repositories import (
    get_refresh_token_repository,
    get_user_repository,
)
from app.http.dependencies.security import get_current_user
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.delete_user_service import DeleteUserService


def delete_user(
    current_user: User = Depends(get_current_user),
    user_repository: UserRepository = Depends(get_user_repository),
    refresh_token_repository: RefreshTokenRepository = Depends(
        get_refresh_token_repository
    ),
):
    service = DeleteUserService(
        user_repository=user_repository,
        refresh_token_repository=refresh_token_repository,
    )
    service.execute(current_user)
