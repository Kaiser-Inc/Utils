from app.domain.role import Role


def test_get_profile_success(test_app, registered_user, auth_headers):
    response = test_app.get("/users/me", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["username"] == registered_user["username"]
    assert data["email"] == registered_user["email"]
    assert data["role"] == Role.USER.value


def test_get_profile_without_token_returns_401(test_app):
    response = test_app.get("/users/me")
    assert response.status_code == 401
