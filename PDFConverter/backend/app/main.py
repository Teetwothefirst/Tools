import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.api.v1.router import api_router
from app.core.storage import storage

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("PDFConverter.Main")

# Background task for ephemeral file cleanup (runs every 15 minutes)
async def ephemeral_janitor_loop():
    while True:
        try:
            logger.info("Running ephemeral storage janitor cleanup...")
            storage.run_cleanup_janitor()
        except Exception as e:
            logger.error(f"Janitor error: {e}")
        await asyncio.sleep(900)

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting PDFConverter FastAPI Backend Engine...")
    janitor_task = asyncio.create_task(ephemeral_janitor_loop())
    yield
    janitor_task.cancel()
    logger.info("Shutting down PDFConverter FastAPI Backend Engine...")

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# CORS middleware for Next.js frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "online",
        "service": settings.PROJECT_NAME,
        "version": "1.0.0",
        "max_file_size_mb": settings.MAX_FILE_SIZE_BYTES // (1024 * 1024),
        "docs": "/docs"
    }

@app.get("/health")
def healthcheck():
    return {"status": "healthy"}
