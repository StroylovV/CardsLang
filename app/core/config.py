from pydantic import HttpUrl, EmailStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class DataBase_Settings(BaseSettings):
    postgres_host: str
    postgres_port: str
    postgres_user: str
    postgres_password: str
    postgres_db: str

   
    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

    @property
    def sync_database_url(self) -> str:
        
        return f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"

class ApiSettings(BaseSettings):
    title: str
    description: str
    version: str
    contact_name: str
    contact_email: EmailStr
    contact_url: str
    

class SecuritySettings(BaseSettings):
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 30

class Settings(BaseSettings):
    
    database: DataBase_Settings
    api: ApiSettings
    security: SecuritySettings
    
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore", 
        env_nested_delimiter="__",  
    )

settings = Settings()


api_config = settings.api
database_config = settings.database
security_config = settings.security