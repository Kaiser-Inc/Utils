import os

from fastapi import Depends, HTTPException, Request, Response, status

from app.http.dependencies.repositories import (
    get_refresh_token_repository,
    get_user_repository,
)
from app.services.auth.refresh_token_service import RefreshTokenService
from app.services.auth.token_service import TokenService


def refresh(
    request: Request,
    response: Response,
    user_repository=Depends(get_user_repository),
    refresh_token_repository=Depends(get_refresh_token_repository),
):
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token"
        )

    service = RefreshTokenService(
        user_repository=user_repository,
        refresh_token_repository=refresh_token_repository,
        token_service=TokenService(),
    )

    try:
        tokens = service.execute(refresh_token)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials."
        )

    SEVEN_DAYS_IN_SECONDS = 60 * 60 * 24 * 7
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=os.getenv("ENV", "development") == "production",
        samesite="lax",
        max_age=SEVEN_DAYS_IN_SECONDS,
        path="/auth/refresh",
    )

    return {
        "access_token": tokens["access_token"],
        "token_type": "bearer",
    }
