import pytest
from uuid import UUID

from app.domain.role import Role
from app.repositories.in_memory.in_memory_user_repository import InMemoryUserRepository
from app.services.register_user_service import RegisterUserService


def test_register_user_success():
    repository = InMemoryUserRepository()
    sut = RegisterUserService(repository)

    user = sut.execute(
        username="TestUser",
        email="user@test.com",
        password="test1234",
        role=Role.USER,
    )

    assert user.id is not None
    assert isinstance(user.id, UUID)
    assert user.username.value == "TestUser"
    assert user.email.value == "user@test.com"
    assert user.role == Role.USER


def test_register_user_duplicate_email_raises_error():
    repository = InMemoryUserRepository()
    sut = RegisterUserService(repository)

    sut.execute(
        username="User1",
        email="duplicate@test.com",
        password="test1234",
        role=Role.USER,
    )

    with pytest.raises(ValueError, match="Email already in use"):
        sut.execute(
            username="User2",
            email="duplicate@test.com",
            password="test1234",
            role=Role.USER,
        )


def test_register_user_duplicate_username_raises_error():
    repository = InMemoryUserRepository()
    sut = RegisterUserService(repository)

    sut.execute(
        username="SameUsername",
        email="user1@test.com",
        password="test1234",
        role=Role.USER,
    )

    with pytest.raises(ValueError, match="Username already taken"):
        sut.execute(
            username="SameUsername",
            email="user2@test.com",
            password="test1234",
            role=Role.USER,
        )
