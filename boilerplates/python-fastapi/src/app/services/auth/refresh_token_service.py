from datetime import datetime, timedelta
from uuid import UUID

from jose import JWTError, jwt

from app.core.settings import settings
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.auth.token_service import TokenService


class RefreshTokenService:
    def __init__(
        self,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
        token_service: TokenService,
    ):
        self.user_repository = user_repository
        self.refresh_token_repository = refresh_token_repository
        self.token_service = token_service

    def execute(self, refresh_token: str) -> dict:
        try:
            payload = jwt.decode(
                refresh_token, settings.secret_key, algorithms=["HS256"]
            )
        except JWTError:
            raise ValueError("Invalid refresh token")

        if payload.get("type") != "refresh":
            raise ValueError("Invalid token type")

        user_id = payload.get("sub")
        if not user_id:
            raise ValueError("Invalid token payload")

        token_hash = self.token_service.hash_refresh_token(refresh_token)

        if not self.refresh_token_repository.exists(token_hash):
            raise ValueError("Refresh token revoked")

        user = self.user_repository.get_by_id(UUID(user_id))
        if not user:
            raise ValueError("User not found")

        self.refresh_token_repository.revoke(token_hash)

        new_access_token = self.token_service.create_access_token(user)
        new_refresh_token = self.token_service.create_refresh_token(user)

        refresh_token_hash = self.token_service.hash_refresh_token(new_refresh_token)
        expires_at = datetime.utcnow() + timedelta(
            days=self.token_service.REFRESH_EXPIRE_DAYS
        )

        self.refresh_token_repository.save(
            user_id=user.id, token_hash=refresh_token_hash, expires_at=expires_at
        )

        return {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
        }
