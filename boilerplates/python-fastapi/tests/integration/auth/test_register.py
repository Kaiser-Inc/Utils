from app.domain.role import Role


def test_register_user_success(test_app):
    payload = {
        "username": "newuser",
        "email": "newuser@example.com",
        "password": "securepass123",
        "role": Role.USER.value,
    }
    response = test_app.post("/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "newuser@example.com"
    assert data["role"] == Role.USER.value
    assert "id" in data


def test_register_user_duplicate_email_returns_400(test_app):
    payload = {
        "username": "user1",
        "email": "same@example.com",
        "password": "password123",
        "role": Role.USER.value,
    }
    test_app.post("/auth/register", json=payload)

    payload["username"] = "user2"
    response = test_app.post("/auth/register", json=payload)

    assert response.status_code == 400
    assert "Email already in use" in response.json()["detail"]


def test_register_user_duplicate_username_returns_400(test_app):
    payload = {
        "username": "sameuser",
        "email": "email1@example.com",
        "password": "password123",
        "role": Role.USER.value,
    }
    test_app.post("/auth/register", json=payload)

    payload["email"] = "email2@example.com"
    response = test_app.post("/auth/register", json=payload)

    assert response.status_code == 400
    assert "Username already taken" in response.json()["detail"]
