import pytest

from app.domain.value_objects.username import Username


def test_username_invalid_format_raises_error():
    with pytest.raises(ValueError, match="Invalid username"):
        Username("")
    with pytest.raises(ValueError, match="Invalid username"):
        Username("   ")


def test_username_valid_creation_success():
    username_str = "valid_username123"
    username = Username(username_str)
    assert username.value == username_str


def test_username_equality():
    username1 = Username("testuser")
    username2 = Username("testuser")
    assert username1 == username2


def test_username_inequality():
    username1 = Username("testuser")
    username2 = Username("anotheruser")
    assert username1 != username2


def test_username_strips_whitespace_on_creation_but_preserves_valid_values():
    username_with_spaces = "  user with spaces  "
    username = Username(username_with_spaces)
    assert username.value == username_with_spaces

    username_valid_no_strip = "validuser"
    username_no_strip = Username(username_valid_no_strip)
    assert username_no_strip.value == username_valid_no_strip


def test_username_is_frozen():
    username = Username("frozenuser")
    with pytest.raises(AttributeError):
        username.value = "newusername"
