import os
import logging
from pathlib import Path
from pdf2docx import Converter
from app.core.storage import storage
from app.tasks.celery_app import task_manager

logger = logging.getLogger("PDFConverter.PdfToWord")

def process_pdf_to_word(task_id: str, input_pdf_path: str, original_filename: str) -> str:
    """
    Converts a PDF file into a Microsoft Word (.docx) document using pdf2docx.
    Returns path to converted docx file.
    """
    logger.info(f"Starting PDF to Word conversion for task {task_id}")
    task_manager.update_task(task_id, "PROCESSING", 30)

    # Base output filename (.docx extension)
    base_name = Path(original_filename).stem
    output_filename = f"{base_name}.docx"
    output_path = storage.get_output_path(output_filename)

    try:
        cv = Converter(input_pdf_path)
        task_manager.update_task(task_id, "PROCESSING", 60)
        
        # Convert all pages into docx layout
        cv.convert(output_path, start=0, end=None)
        cv.close()
        
        task_manager.update_task(task_id, "PROCESSING", 90)
        logger.info(f"Successfully converted PDF to Word for task {task_id}: {output_path}")
        return output_path
    except Exception as e:
        logger.error(f"pdf2docx conversion failed for task {task_id}: {e}")
        raise RuntimeError(f"PDF to Word conversion failed: {str(e)}")
