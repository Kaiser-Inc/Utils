from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.responses import HTMLResponse
from scalar_fastapi.scalar_fastapi import get_scalar_api_reference


def configure_openapi(app: FastAPI) -> None:
    def custom_openapi():
        if app.openapi_schema:
            return app.openapi_schema

        openapi_schema = get_openapi(
            title="Boilerplate",
            version="1.0.0",
            description="FastAPI boilerplate with authentication and user management",
            routes=app.routes,
        )

        openapi_schema["components"]["securitySchemes"] = {
            "BearerAuth": {
                "type": "http",
                "scheme": "bearer",
                "bearerFormat": "JWT",
            }
        }

        PUBLIC_PATHS = {
            "/health",
            "/auth/register",
            "/auth/session",
            "/auth/refresh",
            "/docs",
            "/openapi.json",
        }

        for path in openapi_schema["paths"]:
            if path in PUBLIC_PATHS:
                continue
            for method in openapi_schema["paths"][path]:
                openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]

        app.openapi_schema = openapi_schema
        return app.openapi_schema

    app.openapi = custom_openapi


def configure_scalar(app: FastAPI) -> None:
    """Registra o endpoint /docs servindo a UI do Scalar."""

    @app.get("/docs", include_in_schema=False)
    async def scalar_html() -> HTMLResponse:
        return get_scalar_api_reference(
            openapi_url=app.openapi_url,
            title=app.title,
        )
