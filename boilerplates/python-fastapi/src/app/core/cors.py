from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from app.core.settings import settings


def configure_cors(app: FastAPI) -> None:
    origins = [o.strip() for o in settings.cors_origin.split(",") if o.strip()]

    app.add_middleware(
        CORSMiddleware,
        allow_origins=origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type", "X-Request-ID"],
    )
