import os
import shutil
import logging
from pathlib import Path
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from app.tasks.celery_app import task_manager
from app.tasks.image_to_text_pipeline import run_image_to_text_pipeline
from app.config import settings

router = APIRouter()
logger = logging.getLogger(__name__)

ALLOWED_IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".bmp", ".tiff", ".tif", ".webp", ".gif"}
ALLOWED_EXTENSIONS = ALLOWED_IMAGE_EXTENSIONS | {".pdf"}


@router.post("/extract")
async def image_to_text_extract(
    file: UploadFile = File(...),
    language: str = Form("eng"),
    dpi: int = Form(300),
):
    """
    POST /api/v1/image-to-text/extract

    Accepts an image (PNG, JPG, BMP, TIFF, WEBP) or PDF.
    Runs high-accuracy Tesseract OCR with:
      - Adaptive image preprocessing for maximum sharpness
      - Automatic table detection & reconstruction
      - Attendance / registration form detection
    Outputs a structured Microsoft Word (.docx) document.
    """
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file provided")

    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Accepted: images (PNG, JPG, BMP, TIFF, WEBP) and PDF."
        )

    task_id = task_manager.create_task()

    settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    settings.OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    input_path = settings.UPLOAD_DIR / f"{task_id}_input{ext}"
    output_path = settings.OUTPUT_DIR / f"{task_id}_extracted.docx"

    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save uploaded file: {e}")
        raise HTTPException(status_code=500, detail="Failed to store uploaded file")

    task_manager.run_in_background(
        _run_extraction_background,
        task_id,
        str(input_path),
        str(output_path),
        language,
        dpi,
    )

    return {
        "task_id": task_id,
        "status": "PENDING",
        "message": "Image-to-text extraction job queued successfully",
        "language": language,
        "dpi": dpi,
        "filename": file.filename,
    }


def _run_extraction_background(
    task_id: str,
    input_path: str,
    output_path: str,
    language: str,
    dpi: int,
) -> str:
    """
    Background worker: runs the full image-to-text + table detection pipeline.
    """
    success = run_image_to_text_pipeline(
        input_path=input_path,
        output_path=output_path,
        language=language,
        dpi=dpi,
    )

    # Clean up input file
    try:
        os.remove(input_path)
    except OSError:
        pass

    if success and os.path.exists(output_path):
        return output_path

    raise RuntimeError("Image-to-text extraction pipeline failed to generate output document")
