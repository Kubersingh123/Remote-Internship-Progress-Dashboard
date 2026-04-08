from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Remote Internship Progress Dashboard API"
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "internship_dashboard"
    jwt_secret_key: str = "change-me"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    upload_dir: str = "uploads"
    openai_api_key: str | None = None
    openai_model: str = "gpt-4o-mini"
    github_token: str | None = None
    frontend_url: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=False)


settings = Settings()
