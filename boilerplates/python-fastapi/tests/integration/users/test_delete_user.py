def test_delete_user_success(test_app, auth_headers):
    response = test_app.delete("/users/me", headers=auth_headers)
    assert response.status_code == 204


def test_delete_user_then_login_fails(test_app, registered_user, auth_headers):
    test_app.delete("/users/me", headers=auth_headers)

    login_response = test_app.post(
        "/auth/session",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert login_response.status_code == 401


def test_delete_without_token_returns_401(test_app):
    response = test_app.delete("/users/me")
    assert response.status_code == 401
