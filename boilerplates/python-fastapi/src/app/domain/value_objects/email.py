from dataclasses import dataclass

from email_validator import EmailNotValidError, validate_email


@dataclass(frozen=True)
class Email:
    value: str

    def __post_init__(self) -> None:
        if not self.value:
            raise ValueError("Email cannot be empty")
        try:
            validated = validate_email(self.value, check_deliverability=False)
            object.__setattr__(self, "value", validated.normalized)
        except EmailNotValidError as e:
            raise ValueError(f"Invalid email format: {e}") from e
