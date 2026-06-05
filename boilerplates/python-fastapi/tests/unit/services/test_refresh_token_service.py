import jwt
import pytest

from app.core.settings import settings
from app.domain.role import Role
from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.in_memory.in_memory_refresh_token_repository import (
    InMemoryRefreshTokenRepository,
)
from app.repositories.in_memory.in_memory_user_repository import InMemoryUserRepository
from app.services.auth.refresh_token_service import RefreshTokenService
from app.services.auth.token_service import TokenService


def make_user(username="rtuser", email="rtuser@example.com") -> User:
    return User.create(
        username=Username(username),
        email=Email(email),
        hashed_password="hashed",
        role=Role.USER,
    )


@pytest.fixture
def token_service() -> TokenService:
    return TokenService()


@pytest.fixture
def user_repository() -> InMemoryUserRepository:
    return InMemoryUserRepository()


@pytest.fixture
def token_repository() -> InMemoryRefreshTokenRepository:
    return InMemoryRefreshTokenRepository()


@pytest.fixture
def service(user_repository, token_repository, token_service) -> RefreshTokenService:
    return RefreshTokenService(user_repository, token_repository, token_service)


def issue(
    service_token: TokenService, repo: InMemoryRefreshTokenRepository, user: User
):
    """Cria um refresh token válido e registra seu hash no repositório."""
    from datetime import datetime, timedelta, timezone

    rt = service_token.create_refresh_token(user)
    repo.save(
        user.id,
        service_token.hash_refresh_token(rt),
        datetime.now(timezone.utc) + timedelta(days=1),
    )
    return rt


def test_execute_rotates_tokens(
    service, user_repository, token_repository, token_service
):
    user = make_user()
    user_repository.create(user)
    refresh_token = issue(token_service, token_repository, user)

    result = service.execute(refresh_token)

    assert "access_token" in result
    assert "refresh_token" in result
    # novo refresh token registrado no repositório
    assert (
        token_repository.exists(
            token_service.hash_refresh_token(result["refresh_token"])
        )
        is True
    )


def test_execute_rejects_garbage_token(service):
    with pytest.raises(ValueError, match="Invalid refresh token"):
        service.execute("not-a-jwt")


def test_execute_rejects_wrong_token_type(service):
    user = make_user()
    token = jwt.encode(
        {"sub": str(user.id), "type": "access"}, settings.secret_key, algorithm="HS256"
    )

    with pytest.raises(ValueError, match="Invalid token type"):
        service.execute(token)


def test_execute_rejects_missing_sub(service):
    token = jwt.encode({"type": "refresh"}, settings.secret_key, algorithm="HS256")

    with pytest.raises(ValueError, match="Invalid token payload"):
        service.execute(token)


def test_execute_rejects_revoked_token(service, user_repository, token_service):
    user = make_user()
    user_repository.create(user)
    # token válido mas nunca registrado no repositório → considerado revogado
    refresh_token = token_service.create_refresh_token(user)

    with pytest.raises(ValueError, match="Refresh token revoked"):
        service.execute(refresh_token)


def test_execute_rejects_unknown_user(service, token_repository, token_service):
    ghost = make_user("ghost", "ghost@example.com")  # nunca persistido
    refresh_token = issue(token_service, token_repository, ghost)

    with pytest.raises(ValueError, match="User not found"):
        service.execute(refresh_token)
