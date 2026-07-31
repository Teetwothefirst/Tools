import os
import shutil
import subprocess
import logging
from pathlib import Path
from app.core.storage import storage
from app.tasks.celery_app import task_manager

logger = logging.getLogger("PDFConverter.WordToPdf")

def find_libreoffice_binary() -> str:
    """
    Locates LibreOffice soffice CLI executable on Windows or Linux/macOS.
    """
    for binary_name in ["soffice", "libreoffice"]:
        path = shutil.which(binary_name)
        if path:
            return path
            
    # Standard Windows install locations fallback
    win_paths = [
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe"
    ]
    for win_path in win_paths:
        if os.path.exists(win_path):
            return win_path
            
    return ""

def process_word_to_pdf(task_id: str, input_docx_path: str, original_filename: str) -> str:
    """
    Converts a Word (.docx/.doc) document into PDF format using headless LibreOffice.
    """
    logger.info(f"Starting Word to PDF conversion for task {task_id}")
    task_manager.update_task(task_id, "PROCESSING", 30)

    base_name = Path(original_filename).stem
    output_filename = f"{base_name}.pdf"
    target_output_path = storage.get_output_path(output_filename)
    output_dir = os.path.dirname(target_output_path)

    soffice_path = find_libreoffice_binary()
    if not soffice_path:
        error_msg = "LibreOffice CLI (`soffice`) not found on system. Please install LibreOffice to enable Word-to-PDF conversion."
        logger.error(error_msg)
        raise RuntimeError(error_msg)

    try:
        task_manager.update_task(task_id, "PROCESSING", 60)
        cmd = [
            soffice_path,
            "--headless",
            "--convert-to", "pdf",
            "--outdir", output_dir,
            input_docx_path
        ]
        
        logger.info(f"Running command: {' '.join(cmd)}")
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=180)
        
        if result.returncode != 0:
            logger.error(f"soffice failed with code {result.returncode}: {result.stderr}")
            raise RuntimeError(f"LibreOffice conversion failed: {result.stderr}")
            
        task_manager.update_task(task_id, "PROCESSING", 90)
        
        # Locate generated PDF in outdir
        generated_name = Path(input_docx_path).stem + ".pdf"
        generated_pdf_path = os.path.join(output_dir, generated_name)
        
        if os.path.exists(generated_pdf_path) and generated_pdf_path != target_output_path:
            shutil.move(generated_pdf_path, target_output_path)
            
        if not os.path.exists(target_output_path):
            raise FileNotFoundError(f"Converted PDF output not found at expected location {target_output_path}")

        logger.info(f"Successfully converted Word to PDF for task {task_id}: {target_output_path}")
        return target_output_path
    except Exception as e:
        logger.error(f"Word to PDF conversion failed for task {task_id}: {e}")
        raise RuntimeError(f"Word to PDF conversion failed: {str(e)}")
