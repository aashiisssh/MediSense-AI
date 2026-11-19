
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    secret_key: str = "development-only-change-this-secret"
    database_url: str = "sqlite:///./medisense.db"
    access_token_expire_minutes: int = 720
    cors_origins: str = (
        "http://localhost:5173,"
        "http://127.0.0.1:5173,"
        "http://localhost:5174,"
        "http://127.0.0.1:5174,"
        "http://localhost:5175,"
        "http://127.0.0.1:5175"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )


settings = Settings()
