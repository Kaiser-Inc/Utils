from fastapi import Depends, HTTPException, status

from app.domain.user import User
from app.http.dependencies.repositories import get_user_repository
from app.http.dependencies.security import get_current_user
from app.repositories.user_repository import UserRepository
from app.schemas.auth import UserResponse
from app.schemas.users import UpdateUserRequest
from app.services.update_user_service import UpdateUserService


def update_profile(
    payload: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    user_repository: UserRepository = Depends(get_user_repository),
) -> UserResponse:
    service = UpdateUserService(user_repository)

    try:
        user = service.execute(
            user=current_user, username=payload.username, email=payload.email
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    return UserResponse(
        id=user.id, username=user.username.value, email=user.email.value, role=user.role
    )
