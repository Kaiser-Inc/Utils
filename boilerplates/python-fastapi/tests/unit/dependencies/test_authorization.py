import pytest
from fastapi import HTTPException, status

from app.domain.role import Role
from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.http.dependencies.authorization import (
    require_admin,
    require_authenticated,
    require_role,
    require_user,
)


def make_user(role: Role) -> User:
    return User.create(
        username=Username("authuser"),
        email=Email("authuser@example.com"),
        hashed_password="hashed",
        role=role,
    )


def test_require_role_allows_matching_role():
    dependency = require_role(Role.ADMIN)
    admin = make_user(Role.ADMIN)

    assert dependency(current_user=admin) is admin


def test_require_role_rejects_other_role():
    dependency = require_role(Role.ADMIN)
    user = make_user(Role.USER)

    with pytest.raises(HTTPException) as exc:
        dependency(current_user=user)

    assert exc.value.status_code == status.HTTP_403_FORBIDDEN
    assert exc.value.detail == "Forbidden"


def test_require_admin_accepts_admin():
    assert require_admin()(current_user=make_user(Role.ADMIN)).is_admin()


def test_require_user_accepts_user():
    assert require_user()(current_user=make_user(Role.USER)).is_user()


@pytest.mark.parametrize("role", [Role.USER, Role.ADMIN])
def test_require_authenticated_accepts_any_known_role(role):
    user = make_user(role)

    assert require_authenticated()(current_user=user) is user
