from datetime import datetime, timedelta, timezone

import pytest

from app.domain.role import Role
from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.sql_alchemy.SQLAlchemy_refresh_token_repository import (
    SQLAlchemyRefreshTokenRepository,
)
from app.repositories.sql_alchemy.SQLAlchemy_user_repository import (
    SQLAlchemyUserRepository,
)


@pytest.fixture
def user_id(db_session):
    """Persiste um usuário (FK de refresh_tokens) e devolve o id."""
    user = User.create(
        username=Username("tokenuser"),
        email=Email("tokenuser@example.com"),
        hashed_password="hashed",
        role=Role.USER,
    )
    SQLAlchemyUserRepository(db_session).create(user)
    return user.id


@pytest.fixture
def repository(db_session) -> SQLAlchemyRefreshTokenRepository:
    return SQLAlchemyRefreshTokenRepository(db_session)


def future() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=1)


def past() -> datetime:
    return datetime.now(timezone.utc) - timedelta(days=1)


def test_save_and_exists(repository, user_id):
    repository.save(user_id, "hash-1", future())

    assert repository.exists("hash-1") is True


def test_exists_false_for_unknown_token(repository):
    assert repository.exists("nope") is False


def test_exists_false_for_expired_token(repository, user_id):
    repository.save(user_id, "expired", past())

    assert repository.exists("expired") is False


def test_revoke_removes_token(repository, user_id):
    repository.save(user_id, "hash-2", future())

    repository.revoke("hash-2")

    assert repository.exists("hash-2") is False


def test_revoke_all_for_user(repository, user_id):
    repository.save(user_id, "hash-a", future())
    repository.save(user_id, "hash-b", future())

    repository.revoke_all_for_user(user_id)

    assert repository.exists("hash-a") is False
    assert repository.exists("hash-b") is False


def test_revoke_all_for_user_keeps_other_users(repository, db_session, user_id):
    other = User.create(
        username=Username("other"),
        email=Email("other@example.com"),
        hashed_password="hashed",
        role=Role.USER,
    )
    SQLAlchemyUserRepository(db_session).create(other)
    repository.save(user_id, "mine", future())
    repository.save(other.id, "theirs", future())

    repository.revoke_all_for_user(user_id)

    assert repository.exists("mine") is False
    assert repository.exists("theirs") is True
