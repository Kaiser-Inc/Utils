from fastapi import Depends, Response

from app.domain.user import User
from app.http.dependencies.repositories import get_refresh_token_repository
from app.http.dependencies.security import get_current_user
from app.repositories.refresh_token_repository import RefreshTokenRepository


def logout(
    response: Response,
    current_user: User = Depends(get_current_user),
    refresh_token_repository: RefreshTokenRepository = Depends(
        get_refresh_token_repository
    ),
):
    refresh_token_repository.revoke_all_for_user(current_user.id)

    response.delete_cookie(key="refresh_token", path="/auth/refresh")

    return {"detail": "Session terminated."}
