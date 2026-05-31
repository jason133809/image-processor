from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # Kimi AI
    kimi_api_key: str
    kimi_api_base: str = "https://api.moonshot.cn/v1"

    # Supabase
    supabase_url: str = ""
    supabase_key: str = ""
    database_url: str

    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # App Settings
    upload_dir: str = "./static/uploads"
    generated_dir: str = "./static/generated"
    max_upload_size: int = 10485760  # 10MB

    # Payment (optional)
    alipay_app_id: str = ""
    alipay_private_key: str = ""
    wechat_app_id: str = ""
    wechat_app_secret: str = ""

    class Config:
        env_file = ".env"
        case_sensitive = False


@lru_cache()
def get_settings():
    return Settings()
