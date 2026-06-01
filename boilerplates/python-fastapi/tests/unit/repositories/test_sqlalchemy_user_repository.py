from uuid import uuid4

import pytest

from app.domain.role import Role
from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.sql_alchemy.SQLAlchemy_user_repository import (
    SQLAlchemyUserRepository,
)


def make_user(
    username: str = "testuser",
    email: str = "testuser@example.com",
    role: Role = Role.USER,
) -> User:
    return User.create(
        username=Username(username),
        email=Email(email),
        hashed_password="hashed",
        role=role,
    )


@pytest.fixture
def repository(db_session) -> SQLAlchemyUserRepository:
    return SQLAlchemyUserRepository(db_session)


def test_create_and_get_by_id(repository):
    user = make_user()
    repository.create(user)

    found = repository.get_by_id(user.id)

    assert found is not None
    assert found.id == user.id
    assert found.username.value == "testuser"
    assert found.email.value == "testuser@example.com"
    assert found.role == Role.USER


def test_get_by_id_not_found(repository):
    assert repository.get_by_id(uuid4()) is None


def test_get_by_email(repository):
    user = make_user()
    repository.create(user)

    found = repository.get_by_email(Email("testuser@example.com"))

    assert found is not None
    assert found.id == user.id


def test_get_by_email_not_found(repository):
    assert repository.get_by_email(Email("missing@example.com")) is None


def test_exists_by_username(repository):
    repository.create(make_user())

    assert repository.exists_by_username(Username("testuser")) is True
    assert repository.exists_by_username(Username("other")) is False


def test_exists_by_email(repository):
    repository.create(make_user())

    assert repository.exists_by_email(Email("testuser@example.com")) is True
    assert repository.exists_by_email(Email("missing@example.com")) is False


def test_save_updates_existing_user(repository):
    user = make_user()
    repository.create(user)

    user.change_username(Username("renamed"))
    user.change_email(Email("renamed@example.com"))
    user.change_password("newhash")
    user.promote_to_admin()
    repository.save(user)

    found = repository.get_by_id(user.id)
    assert found.username.value == "renamed"
    assert found.email.value == "renamed@example.com"
    assert found.hashed_password == "newhash"
    assert found.role == Role.ADMIN


def test_save_raises_when_user_missing(repository):
    user = make_user()

    with pytest.raises(ValueError, match="User not found."):
        repository.save(user)


def test_delete_existing_user(repository):
    user = make_user()
    repository.create(user)

    repository.delete(user)

    assert repository.get_by_id(user.id) is None


def test_delete_missing_user_is_noop(repository):
    user = make_user()

    repository.delete(user)  # não deve levantar

    assert repository.get_by_id(user.id) is None
