from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")
    db_host: str
    db_port: int
    db_name: str
    db_user: str
    db_password: str

    secret_key: str

    cors_origin: str = "http://localhost:4200"
    environment: str = "development"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg2://"
            f"{self.db_user}:{self.db_password}"
            f"@{self.db_host}:{self.db_port}/{self.db_name}"
        )


settings = Settings()
