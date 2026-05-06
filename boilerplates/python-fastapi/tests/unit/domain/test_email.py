import pytest

from app.domain.value_objects.email import Email


def test_email_invalid_format_raises_error():
    with pytest.raises(ValueError, match="Email cannot be empty"):
        Email("")
    with pytest.raises(ValueError, match="Invalid email format"):
        Email("invalid-email")
    with pytest.raises(ValueError, match="Invalid email format"):
        Email("user@")
    with pytest.raises(ValueError, match="Invalid email format"):
        Email("@domain.com")


def test_email_valid_creation_success():
    email_str = "valid@example.com"
    email = Email(email_str)
    assert email.value == email_str


def test_email_equality():
    email1 = Email("test@example.com")
    email2 = Email("test@example.com")
    assert email1 == email2


def test_email_inequality():
    email1 = Email("test@example.com")
    email2 = Email("another@example.com")
    assert email1 != email2


def test_email_is_frozen():
    email = Email("frozen@example.com")
    with pytest.raises(AttributeError):
        email.value = "new@example.com"
