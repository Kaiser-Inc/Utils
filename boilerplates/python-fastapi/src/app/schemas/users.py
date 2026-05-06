from pydantic import BaseModel, EmailStr


class UpdateUserRequest(BaseModel):
    username: str | None = None
    email: EmailStr | None = None
