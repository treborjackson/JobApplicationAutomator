from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    anthropic_api_key: str
    adzuna_app_id: str = ""
    adzuna_api_key: str = ""
    rapidapi_key: str = ""
    sendgrid_api_key: str = ""
    sendgrid_from_email: str = ""
    upload_dir: str = "./uploads"
    aws_s3_bucket: str = ""
    aws_access_key_id: str = ""
    aws_secret_access_key: str = ""

    access_token_expire_minutes: int = 60 * 24        # 24h
    refresh_token_expire_minutes: int = 60 * 24 * 7   # 7d
    algorithm: str = "HS256"
    max_upload_size_bytes: int = 5 * 1024 * 1024      # 5MB

    class Config:
        env_file = ".env"


settings = Settings()
