def test_logout_success(test_app, registered_user, auth_headers):
    test_app.post(
        "/auth/session",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )

    response = test_app.patch("/auth/logout", headers=auth_headers)

    assert response.status_code == 200
    assert response.json()["detail"] == "Session terminated."


def test_logout_without_token_returns_401(test_app):
    response = test_app.patch("/auth/logout")
    assert response.status_code == 401
