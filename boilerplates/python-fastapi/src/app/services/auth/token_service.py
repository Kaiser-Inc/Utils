import hashlib
from datetime import datetime, timedelta, timezone

import jwt

from app.core.settings import settings
from app.domain.user import User


class TokenService:
    ACCESS_EXPIRE_MIN = 15
    REFRESH_EXPIRE_DAYS = 7
    ALGORITHM = "HS256"

    def create_access_token(self, user: User) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "role": user.role.value,
            "type": "access",
            "iat": now,
            "exp": now + timedelta(minutes=self.ACCESS_EXPIRE_MIN),
        }
        return jwt.encode(payload, settings.secret_key, algorithm=self.ALGORITHM)

    def create_refresh_token(self, user: User) -> str:
        now = datetime.now(timezone.utc)
        payload = {
            "sub": str(user.id),
            "type": "refresh",
            "iat": now,
            "exp": now + timedelta(days=self.REFRESH_EXPIRE_DAYS),
        }
        return jwt.encode(payload, settings.secret_key, algorithm=self.ALGORITHM)

    def hash_refresh_token(self, token: str) -> str:
        return hashlib.sha256(token.encode()).hexdigest()
