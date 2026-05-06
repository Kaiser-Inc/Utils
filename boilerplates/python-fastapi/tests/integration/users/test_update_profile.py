def test_update_username_success(test_app, auth_headers):
    response = test_app.put(
        "/users/me",
        json={"username": "updateduser"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "updateduser"


def test_update_email_success(test_app, auth_headers):
    response = test_app.put(
        "/users/me",
        json={"email": "updated@example.com"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "updated@example.com"


def test_update_without_token_returns_401(test_app):
    response = test_app.put("/users/me", json={"username": "new"})
    assert response.status_code == 401
