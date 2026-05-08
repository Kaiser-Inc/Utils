from datetime import datetime, timedelta, timezone

from app.core.security import verify_password
from app.domain.value_objects.email import Email
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.user_repository import UserRepository
from app.services.auth.token_service import TokenService


class AuthenticateUserService:
    def __init__(
        self,
        user_repository: UserRepository,
        refresh_token_repository: RefreshTokenRepository,
        token_service: TokenService,
    ):
        self.user_repository = user_repository
        self.refresh_token_repository = refresh_token_repository
        self.token_service = token_service

    def execute(self, email: str, password: str) -> dict:

        email_vo = Email(email)

        user = self.user_repository.get_by_email(email_vo)

        if not user:
            raise ValueError("Invalid Credentials")

        if not verify_password(password, user.hashed_password):
            raise ValueError("Invalid Credentials")

        access_token = self.token_service.create_access_token(user)

        refresh_token = self.token_service.create_refresh_token(user)
        refresh_token_hash = self.token_service.hash_refresh_token(refresh_token)
        expires_at = datetime.now(timezone.utc) + timedelta(
            days=self.token_service.REFRESH_EXPIRE_DAYS
        )

        self.refresh_token_repository.save(
            user_id=user.id, token_hash=refresh_token_hash, expires_at=expires_at
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }
