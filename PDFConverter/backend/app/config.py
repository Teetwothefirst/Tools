import os
from pathlib import Path
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "PDFConverter Engine"
    API_V1_STR: str = "/api/v1"
    
    # 300MB max per file limit (in bytes)
    MAX_FILE_SIZE_BYTES: int = 300 * 1024 * 1024  
    
    # Storage Settings
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    UPLOAD_DIR: Path = BASE_DIR / "temp" / "uploads"
    OUTPUT_DIR: Path = BASE_DIR / "temp" / "outputs"
    
    # Ephemeral auto-cleanup age in seconds (2 hours)
    EPHEMERAL_CLEANUP_SECONDS: int = 7200
    
    # Redis / Celery
    REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")
    USE_CELERY: bool = os.getenv("USE_CELERY", "false").lower() == "true"
    
    # S3 Settings (Optional)
    S3_ENABLED: bool = os.getenv("S3_ENABLED", "false").lower() == "true"
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "pdfconverter-ephemeral")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID", "")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY", "")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    S3_ENDPOINT_URL: str = os.getenv("S3_ENDPOINT_URL", "")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
