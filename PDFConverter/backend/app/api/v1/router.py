from fastapi import APIRouter
from app.api.v1 import convert, repair, tasks, ocr, image_to_text

api_router = APIRouter()

api_router.include_router(convert.router, tags=["Conversion"])
api_router.include_router(repair.router, tags=["Repair"])
api_router.include_router(ocr.router, prefix="/ocr", tags=["OCR Engine"])
api_router.include_router(image_to_text.router, prefix="/image-to-text", tags=["Image to Text"])
api_router.include_router(tasks.router, tags=["Tasks & Downloads"])
