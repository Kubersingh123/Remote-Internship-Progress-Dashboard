from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Remote Internship Progress Dashboard API"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "internship_dashboard"
    secret_key: str = Field(default="change-me", alias="SECRET_KEY")
    algorithm: str = Field(default="HS256", alias="ALGORITHM")
    jwt_secret_key: str | None = None
    jwt_algorithm: str | None = None
    access_token_expire_minutes: int = 1440
    upload_dir: str = "uploads"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    github_token: str | None = None
    frontend_url: str = "http://localhost:5173,http://localhost:3000"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)

    @property
    def resolved_secret_key(self) -> str:
        # Backward compatibility for older deployments still using JWT_SECRET_KEY.
        return self.jwt_secret_key or self.secret_key

    @property
    def resolved_algorithm(self) -> str:
        # Backward compatibility for older deployments still using JWT_ALGORITHM.
        return self.jwt_algorithm or self.algorithm

    @property
    def cors_origins(self) -> list[str]:
        origins = [origin.strip().rstrip("/") for origin in self.frontend_url.split(",") if origin.strip()]
        defaults = ["http://localhost:5173", "http://localhost:3000"]
        merged = [*origins, *defaults]
        # Preserve order while removing duplicates.
        return list(dict.fromkeys(merged))


settings = Settings()
