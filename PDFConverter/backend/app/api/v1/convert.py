from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.core.security import secure_filename, validate_file_size
from app.core.storage import storage
from app.tasks.celery_app import task_manager
from app.tasks.pdf_to_word import process_pdf_to_word
from app.tasks.word_to_pdf import process_word_to_pdf

router = APIRouter()

@router.post("/convert/pdf-to-word")
async def convert_pdf_to_word_endpoint(file: UploadFile = File(...)):
    """
    Accepts PDF upload, sanitizes filename, validates 300MB size limit,
    and enqueues background PDF-to-Word task.
    """
    validate_file_size(file)
    
    clean_filename = secure_filename(file.filename)
    if not clean_filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid PDF (.pdf) file."
        )

    content = await file.read()
    saved_path = storage.save_upload(content, clean_filename)

    task_id = task_manager.create_task()
    task_manager.run_in_background(
        process_pdf_to_word,
        task_id,
        saved_path,
        clean_filename
    )

    return {
        "task_id": task_id,
        "status": "PENDING",
        "message": "PDF to Word conversion task queued successfully."
    }

@router.post("/convert/word-to-pdf")
async def convert_word_to_pdf_endpoint(file: UploadFile = File(...)):
    """
    Accepts Word (.docx / .doc) upload, sanitizes filename, validates 300MB size cap,
    and enqueues headless LibreOffice Word-to-PDF conversion.
    """
    validate_file_size(file)
    
    clean_filename = secure_filename(file.filename)
    if not (clean_filename.lower().endswith(".docx") or clean_filename.lower().endswith(".doc")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid file format. Please upload a valid Microsoft Word (.docx or .doc) file."
        )

    content = await file.read()
    saved_path = storage.save_upload(content, clean_filename)

    task_id = task_manager.create_task()
    task_manager.run_in_background(
        process_word_to_pdf,
        task_id,
        saved_path,
        clean_filename
    )

    return {
        "task_id": task_id,
        "status": "PENDING",
        "message": "Word to PDF conversion task queued successfully."
    }
