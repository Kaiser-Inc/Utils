from fastapi import Depends, HTTPException, Response, status

from app.http.dependencies.repositories import (
    get_refresh_token_repository,
    get_user_repository,
)
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest
from app.services.auth.token_service import TokenService
from app.services.authenticate_user_service import AuthenticateUserService


def login(
    payload: LoginRequest,
    response: Response,
    user_repository: UserRepository = Depends(get_user_repository),
    refresh_token_repository: RefreshTokenRepository = Depends(
        get_refresh_token_repository
    ),
):
    service = AuthenticateUserService(
        user_repository=user_repository,
        refresh_token_repository=refresh_token_repository,
        token_service=TokenService(),
    )

    try:
        tokens = service.execute(payload.email, payload.password)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials."
        )

    SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=SEVEN_DAYS_IN_SECONDS,
        path="/auth/refresh",
    )

    return {
        "access_token": tokens["access_token"],
        "token_type": "bearer",
    }
