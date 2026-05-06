from fastapi import APIRouter

from app.http.controllers.users.delete_user_controller import delete_user
from app.http.controllers.users.get_profile_controller import get_profile
from app.http.controllers.users.update_profile_controller import update_profile

router = APIRouter(prefix="/users", tags=["Users"])

router.get("/me", status_code=200)(get_profile)
router.put("/me", status_code=200)(update_profile)
router.delete("/me", status_code=204)(delete_user)
