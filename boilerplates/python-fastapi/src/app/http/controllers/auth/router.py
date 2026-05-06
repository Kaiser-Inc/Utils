from fastapi import APIRouter

from app.http.controllers.auth.authentication_controller import login
from app.http.controllers.auth.logout_controller import logout
from app.http.controllers.auth.refresh_token_controller import refresh
from app.http.controllers.auth.register_controller import register_user
from app.schemas.auth import AccessTokenResponse, UserResponse

router = APIRouter(prefix="/auth", tags=["Auth"])

router.post("/register", response_model=UserResponse, status_code=201)(register_user)
router.post("/session", response_model=AccessTokenResponse, status_code=200)(login)
router.patch("/refresh", response_model=AccessTokenResponse, status_code=200)(refresh)
router.patch("/logout", status_code=200)(logout)
