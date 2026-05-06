def test_login_success(test_app, registered_user):
    response = test_app.post(
        "/auth/session",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_login_invalid_password_returns_401(test_app, registered_user):
    response = test_app.post(
        "/auth/session",
        json={
            "email": registered_user["email"],
            "password": "wrongpassword",
        },
    )

    assert response.status_code == 401


def test_login_non_existent_user_returns_401(test_app):
    response = test_app.post(
        "/auth/session",
        json={
            "email": "nonexistent@example.com",
            "password": "password123",
        },
    )

    assert response.status_code == 401
