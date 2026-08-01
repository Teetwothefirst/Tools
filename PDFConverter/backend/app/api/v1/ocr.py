import os
import shutil
import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from app.tasks.celery_app import task_manager
from app.tasks.ocr_pipeline import run_ocr_pipeline, process_ocr_searchable_pdf_task

router = APIRouter()
logger = logging.getLogger(__name__)

TEMP_DIR = os.path.join(os.getcwd(), "temp")

@router.post("/pdf-to-searchable")
async def ocr_pdf_to_searchable(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    language: str = Form("eng"),
    deskew: bool = Form(True),
    clean: bool = Form(True),
):
    """
    POST /api/v1/ocr/pdf-to-searchable
    Performs OCR processing on scanned or image-based PDF files using Tesseract & ocrmypdf.
    Converts non-editable PDF into a searchable, text-selectable PDF document.
    """
    if not file.filename or not file.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files (.pdf) are supported for OCR processing")

    task_id = task_manager.create_task()

    os.makedirs(TEMP_DIR, exist_ok=True)
    input_path = os.path.join(TEMP_DIR, f"{task_id}_input.pdf")
    output_path = os.path.join(TEMP_DIR, f"{task_id}_searchable.pdf")

    try:
        with open(input_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        logger.error(f"Failed to save uploaded file for OCR: {e}")
        raise HTTPException(status_code=500, detail="Failed to store uploaded PDF file")

    if task_manager.use_celery and hasattr(process_ocr_searchable_pdf_task, "delay"):
        try:
            process_ocr_searchable_pdf_task.delay(
                task_id=task_id,
                input_path=input_path,
                output_path=output_path,
                language=language,
                deskew=deskew,
                clean=clean,
            )
            logger.info(f"Dispatched OCR Celery task {task_id}")
        except Exception as e:
            logger.warning(f"Celery dispatch failed ({e}), using async background task runner")
            task_manager.run_in_background(
                _run_ocr_background,
                task_id,
                input_path,
                output_path,
                language,
                deskew,
                clean,
            )
    else:
        task_manager.run_in_background(
            _run_ocr_background,
            task_id,
            input_path,
            output_path,
            language,
            deskew,
            clean,
        )

    return {
        "task_id": task_id,
        "status": "PENDING",
        "message": "OCR Scanned PDF processing job queued successfully",
        "language": language,
        "deskew": deskew,
        "clean": clean,
    }

def _run_ocr_background(task_id: str, input_path: str, output_path: str, language: str, deskew: bool, clean: bool) -> str:
    """
    Background worker execution wrapper for in-memory fallback.
    """
    success = run_ocr_pipeline(
        input_path=input_path,
        output_path=output_path,
        lang=language,
        deskew=deskew,
        clean=clean,
    )
    if success and os.path.exists(output_path):
        return output_path
    raise RuntimeError("OCR Processing Pipeline failed to generate output PDF file")
