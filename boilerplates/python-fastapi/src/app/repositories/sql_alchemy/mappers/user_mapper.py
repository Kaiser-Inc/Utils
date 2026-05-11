from app.domain.role import Role
from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.sql_alchemy.models.user_model import UserModel


def to_domain(model: UserModel) -> User:
    return User.reconstitute(
        user_id=model.id,
        username=Username(model.username),
        email=Email(model.email),
        hashed_password=model.hashed_password,
        role=Role(model.role),
    )


def to_model(user: User) -> UserModel:
    return UserModel(
        id=user.id,
        username=user.username.value,
        email=user.email.value,
        hashed_password=user.hashed_password,
        role=user.role.value,
    )
