import pytest
from fastapi.testclient import TestClient

from app.core.application import create_app
from app.domain.role import Role
from app.repositories.in_memory.in_memory_refresh_token_repository import (
    InMemoryRefreshTokenRepository,
)
from app.repositories.in_memory.in_memory_user_repository import InMemoryUserRepository
from app.http.dependencies.repositories import (
    get_user_repository,
    get_refresh_token_repository,
)


@pytest.fixture
def user_repository():
    return InMemoryUserRepository()


@pytest.fixture
def refresh_token_repository():
    return InMemoryRefreshTokenRepository()


@pytest.fixture
def test_app(user_repository, refresh_token_repository):
    app = create_app(testing=True)

    app.dependency_overrides[get_user_repository] = lambda: user_repository
    app.dependency_overrides[get_refresh_token_repository] = (
        lambda: refresh_token_repository
    )

    return TestClient(app)


@pytest.fixture
def registered_user(test_app):
    """Register a user and return the payload used."""
    payload = {
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "password123",
        "role": Role.USER.value,
    }
    test_app.post("/auth/register", json=payload)
    return payload


@pytest.fixture
def auth_headers(test_app, registered_user):
    """Return Authorization headers for a registered user."""
    response = test_app.post(
        "/auth/session",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
