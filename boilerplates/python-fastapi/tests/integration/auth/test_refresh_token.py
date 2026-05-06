def test_refresh_token_success(test_app, registered_user):
    login_response = test_app.post(
        "/auth/session",
        json={
            "email": registered_user["email"],
            "password": registered_user["password"],
        },
    )
    assert login_response.status_code == 200

    response = test_app.patch("/auth/refresh")

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"


def test_refresh_token_missing_cookie_returns_401(test_app):
    response = test_app.patch("/auth/refresh")
    assert response.status_code == 401
    assert "Missing refresh token" in response.json()["detail"]
