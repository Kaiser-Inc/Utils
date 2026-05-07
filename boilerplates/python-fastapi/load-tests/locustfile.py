import os
import random
import string
import uuid

from locust import HttpUser, between, task


API_URL = os.getenv("API_URL", "http://api:8000")


def _random_string(length: int = 8) -> str:
    return "".join(random.choices(string.ascii_lowercase + string.digits, k=length))


def _make_credentials() -> dict:
    uid = str(uuid.uuid4()).replace("-", "")[:12]
    return {
        "username": f"user_{uid}",
        "email": f"user_{uid}@loadtest.local",
        "password": "Load@Test123!",
    }


class AuthFlow(HttpUser):
    """
    Simulates the full auth lifecycle:
      register -> login -> refresh -> logout
    """

    host = API_URL
    wait_time = between(0.5, 2)

    def on_start(self) -> None:
        self.access_token: str | None = None
        self.refresh_token: str | None = None
        self.credentials = _make_credentials()

    # ------------------------------------------------------------------ #
    # Tasks                                                                #
    # ------------------------------------------------------------------ #

    @task(1)
    def register(self) -> None:
        with self.client.post(
            "/auth/register",
            json=self.credentials,
            catch_response=True,
            name="/auth/register",
        ) as resp:
            if resp.status_code in (200, 201):
                resp.success()
            elif resp.status_code == 409:
                # already registered — rotate credentials and move on
                self.credentials = _make_credentials()
                resp.success()
            else:
                resp.failure(f"register failed: {resp.status_code} {resp.text[:200]}")

    @task(3)
    def login(self) -> None:
        payload = {
            "username": self.credentials["username"],
            "password": self.credentials["password"],
        }
        with self.client.post(
            "/auth/login",
            json=payload,
            catch_response=True,
            name="/auth/login",
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token")
                self.refresh_token = data.get("refresh_token")
                resp.success()
            else:
                resp.failure(f"login failed: {resp.status_code} {resp.text[:200]}")

    @task(2)
    def refresh(self) -> None:
        if not self.refresh_token:
            return
        with self.client.post(
            "/auth/refresh",
            json={"refresh_token": self.refresh_token},
            catch_response=True,
            name="/auth/refresh",
        ) as resp:
            if resp.status_code == 200:
                data = resp.json()
                self.access_token = data.get("access_token", self.access_token)
                self.refresh_token = data.get("refresh_token", self.refresh_token)
                resp.success()
            else:
                resp.failure(f"refresh failed: {resp.status_code} {resp.text[:200]}")

    @task(1)
    def logout(self) -> None:
        if not self.access_token:
            return
        with self.client.post(
            "/auth/logout",
            headers={"Authorization": f"Bearer {self.access_token}"},
            catch_response=True,
            name="/auth/logout",
        ) as resp:
            if resp.status_code in (200, 204):
                self.access_token = None
                self.refresh_token = None
                resp.success()
            else:
                resp.failure(f"logout failed: {resp.status_code} {resp.text[:200]}")


class AuthenticatedUser(HttpUser):
    """
    Simulates an already-authenticated user:
      login -> get profile -> update profile
    """

    host = API_URL
    wait_time = between(0.5, 2)

    def on_start(self) -> None:
        self.access_token: str | None = None
        self.credentials = _make_credentials()
        self._register_and_login()

    # ------------------------------------------------------------------ #
    # Setup helpers                                                        #
    # ------------------------------------------------------------------ #

    def _register_and_login(self) -> None:
        """Register then login to obtain a token before tasks begin."""
        self.client.post("/auth/register", json=self.credentials)

        resp = self.client.post(
            "/auth/login",
            json={
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            },
        )
        if resp.status_code == 200:
            self.access_token = resp.json().get("access_token")

    def _auth_headers(self) -> dict:
        if self.access_token:
            return {"Authorization": f"Bearer {self.access_token}"}
        return {}

    def _re_login(self) -> None:
        resp = self.client.post(
            "/auth/login",
            json={
                "username": self.credentials["username"],
                "password": self.credentials["password"],
            },
        )
        if resp.status_code == 200:
            self.access_token = resp.json().get("access_token")

    # ------------------------------------------------------------------ #
    # Tasks                                                                #
    # ------------------------------------------------------------------ #

    @task(3)
    def get_profile(self) -> None:
        with self.client.get(
            "/users/me",
            headers=self._auth_headers(),
            catch_response=True,
            name="/users/me [GET]",
        ) as resp:
            if resp.status_code == 200:
                resp.success()
            elif resp.status_code == 401:
                self._re_login()
                resp.failure("401 on GET /users/me — re-logging in")
            else:
                resp.failure(f"get_profile failed: {resp.status_code} {resp.text[:200]}")

    @task(2)
    def update_profile(self) -> None:
        payload = {"username": f"user_{_random_string(6)}"}
        with self.client.put(
            "/users/me",
            json=payload,
            headers=self._auth_headers(),
            catch_response=True,
            name="/users/me [PUT]",
        ) as resp:
            if resp.status_code in (200, 204):
                resp.success()
            elif resp.status_code == 401:
                self._re_login()
                resp.failure("401 on PUT /users/me — re-logging in")
            else:
                resp.failure(f"update_profile failed: {resp.status_code} {resp.text[:200]}")
