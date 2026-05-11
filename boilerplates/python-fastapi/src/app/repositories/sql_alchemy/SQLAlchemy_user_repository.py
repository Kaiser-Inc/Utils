# pylint: disable=invalid-name
from uuid import UUID

from sqlalchemy.orm import Session

from app.domain.user import User
from app.domain.value_objects.email import Email
from app.domain.value_objects.username import Username
from app.repositories.sql_alchemy.mappers.user_mapper import to_domain, to_model
from app.repositories.sql_alchemy.models.user_model import UserModel
from app.repositories.user_repository import UserRepository


class SQLAlchemyUserRepository(UserRepository):
    def __init__(self, session: Session):
        self.session = session

    def create(self, user: User) -> None:
        model = to_model(user)
        self.session.add(model)
        self.session.commit()

    def save(self, user: User) -> None:
        model = self.session.get(UserModel, user.id)

        if not model:
            raise ValueError("User not found.")

        model.username = user.username.value
        model.email = user.email.value
        model.hashed_password = user.hashed_password
        model.role = user.role.value

        self.session.commit()

    def get_by_email(self, email: Email) -> User | None:
        model = (
            self.session.query(UserModel).filter(UserModel.email == email.value).first()
        )
        return to_domain(model) if model else None

    def get_by_id(self, user_id: UUID) -> User | None:
        model = self.session.get(UserModel, user_id)
        return to_domain(model) if model else None

    def exists_by_username(self, username: Username) -> bool:
        return (
            self.session.query(UserModel)
            .filter(UserModel.username == username.value)
            .first()
            is not None
        )

    def exists_by_email(self, email: Email) -> bool:
        return (
            self.session.query(UserModel).filter(UserModel.email == email.value).first()
            is not None
        )

    def delete(self, user: User) -> None:
        model = self.session.get(UserModel, user.id)
        if not model:
            return

        self.session.delete(model)
        self.session.commit()
