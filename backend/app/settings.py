from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_ignore_empty=True, extra="ignore")

    DATABASE_URL: str = Field(..., description="PostgreSQL connection string")
    JWT_SECRET: str = Field("change-me", description="Secret used to sign JWTs")
    JWT_ALGORITHM: str = Field("HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(60*24*7)  # 7 days

    ADMIN_USER: str = Field("admin")
    ADMIN_PASS: str = Field("admin123")

    IPIRANGA_LIMIT_PER_QUINZENA: float = Field(1000.0)

settings = Settings()
