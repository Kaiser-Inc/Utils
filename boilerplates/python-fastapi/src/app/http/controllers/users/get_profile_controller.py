from fastapi import Depends

from app.domain.user import User
from app.http.dependencies.security import get_current_user
from app.schemas.auth import UserResponse


def get_profile(current_user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(
        id=current_user.id,
        username=current_user.username.value,
        email=current_user.email.value,
        role=current_user.role,
    )
