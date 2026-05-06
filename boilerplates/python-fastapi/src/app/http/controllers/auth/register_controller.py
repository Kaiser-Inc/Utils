from fastapi import Depends, HTTPException, status

from app.http.dependencies.repositories import get_user_repository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import RegisterUserRequest, UserResponse
from app.services.register_user_service import RegisterUserService


def register_user(
    payload: RegisterUserRequest,
    user_repository: UserRepository = Depends(get_user_repository),
) -> UserResponse:
    service = RegisterUserService(user_repository)

    try:
        user = service.execute(
            username=payload.username,
            email=payload.email,
            password=payload.password,
            role=payload.role,
        )
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    return UserResponse(
        id=user.id, username=user.username.value, email=user.email.value, role=user.role
    )
