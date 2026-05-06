import os

from fastapi import FastAPI

from app.core.cors import configure_cors
from app.core.openapi import configure_openapi, configure_scalar
from app.core.telemetry import configure_telemetry
from app.http.controllers.auth.router import router as authentication_router
from app.http.controllers.health_controller import router as health_router
from app.http.controllers.users.router import router as users_router


def create_app(testing: bool = False) -> FastAPI:
    # Desativa a UI padrão do FastAPI — Scalar serve como única interface de docs
    app = FastAPI(
        title="Boilerplate",
        docs_url=None,
        redoc_url=None,
    )

    configure_cors(app)
    configure_openapi(app)
    configure_scalar(app)

    otlp_endpoint = os.getenv("OTLP_ENDPOINT", "http://jaeger:4317")

    if not testing:
        configure_telemetry(app, "boilerplate_api", otlp_endpoint)

    app.include_router(health_router)
    app.include_router(authentication_router)
    app.include_router(users_router)

    return app
