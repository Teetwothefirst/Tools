from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.security import secure_filename, validate_file_size
from app.core.storage import storage
from app.tasks.celery_app import task_manager
from app.tasks.pdf_repair import process_pdf_repair

router = APIRouter()

@router.post("/repair/pdf")
async def repair_pdf_endpoint(file: UploadFile = File(...)):
    """
    Accepts corrupted or broken PDF, sanitizes filename, validates 300MB limit,
    and enqueues Ghostscript / PyMuPDF repair pipeline task.
    """
    validate_file_size(file)
    
    clean_filename = secure_filename(file.filename)
    if not clean_filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a PDF (.pdf) file to repair."
        )

    content = await file.read()
    saved_path = storage.save_upload(content, clean_filename)

    task_id = task_manager.create_task()
    task_manager.run_in_background(
        process_pdf_repair,
        task_id,
        saved_path,
        clean_filename
    )

    return {
        "task_id": task_id,
        "status": "PENDING",
        "message": "PDF Repair task queued successfully."
    }
