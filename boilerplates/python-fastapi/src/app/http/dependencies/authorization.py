from fastapi import Depends, HTTPException, status

from app.domain.role import Role
from app.domain.user import User
from app.http.dependencies.security import get_current_user


def require_role(*allowed_roles: Role):
    def dependency(current_user: User = Depends(get_current_user)) -> User:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden"
            )

        return current_user

    return dependency


def require_admin():
    return require_role(Role.ADMIN)


def require_user():
    return require_role(Role.USER)


def require_authenticated():
    return require_role(Role.USER, Role.ADMIN)
