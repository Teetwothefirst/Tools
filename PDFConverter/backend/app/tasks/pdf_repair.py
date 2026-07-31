import os
import shutil
import subprocess
import logging
import fitz  # PyMuPDF
from pathlib import Path
from app.core.storage import storage
from app.tasks.celery_app import task_manager

logger = logging.getLogger("PDFConverter.PdfRepair")

def find_ghostscript_binary() -> str:
    """
    Locates Ghostscript `gs` or `gswin64c` executable.
    """
    for binary_name in ["gs", "gswin64c", "gswin32c"]:
        path = shutil.which(binary_name)
        if path:
            return path
            
    # Windows fallback locations
    win_paths = [
        r"C:\Program Files\gs\gs10.02.1\bin\gswin64c.exe",
        r"C:\Program Files\gs\gs10.02.0\bin\gswin64c.exe",
        r"C:\Program Files (x86)\gs\gs10.02.1\bin\gswin32c.exe"
    ]
    for win_path in win_paths:
        if os.path.exists(win_path):
            return win_path
            
    return ""

def process_pdf_repair(task_id: str, input_pdf_path: str, original_filename: str) -> str:
    """
    Repairs corrupted PDF files by parsing XRef tables, rebuilding stream structures,
    and salvaging page trees using a multi-tiered repair pipeline.
    """
    logger.info(f"Starting PDF Repair task {task_id}")
    task_manager.update_task(task_id, "PROCESSING", 30)

    base_name = Path(original_filename).stem
    output_filename = f"{base_name}_repaired.pdf"
    output_path = storage.get_output_path(output_filename)

    # Strategy 1: Ghostscript CLI Repair
    gs_path = find_ghostscript_binary()
    if gs_path:
        logger.info(f"Ghostscript binary found at {gs_path}. Using Ghostscript pdfwrite engine.")
        try:
            task_manager.update_task(task_id, "PROCESSING", 50)
            cmd = [
                gs_path,
                "-o", output_path,
                "-sDEVICE=pdfwrite",
                "-dPDFSETTINGS=/prepress",
                "-dNullReport",
                input_pdf_path
            ]
            
            logger.info(f"Executing Ghostscript: {' '.join(cmd)}")
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
                task_manager.update_task(task_id, "PROCESSING", 90)
                logger.info(f"Ghostscript successfully repaired PDF for task {task_id}")
                return output_path
            else:
                logger.warning("Ghostscript repair did not produce non-empty file. Fallback to PyMuPDF.")
        except Exception as e:
            logger.warning(f"Ghostscript repair attempt failed: {e}. Fallback to PyMuPDF.")

    # Strategy 2: PyMuPDF Multi-Tier Resilient Repair Engine
    logger.info(f"Using PyMuPDF (fitz) resilient repair engine for task {task_id}")
    task_manager.update_task(task_id, "PROCESSING", 70)

    doc = None
    try:
        # Open PDF (fitz automatically repairs XRef table pointers on open)
        doc = fitz.open(input_pdf_path)
    except Exception as open_err:
        logger.error(f"PyMuPDF failed to open PDF {input_pdf_path}: {open_err}")
        raise RuntimeError(f"PDF structure is severely damaged and unreadable: {str(open_err)}")

    # Tier A: Try full clean & garbage collection save
    try:
        logger.info("PyMuPDF Tier A: Attempting full stream clean & garbage collection save...")
        doc.save(output_path, garbage=4, deflate=True, clean=True)
        doc.close()
        task_manager.update_task(task_id, "PROCESSING", 90)
        logger.info(f"PyMuPDF Tier A repair succeeded for task {task_id}")
        return output_path
    except Exception as err_a:
        logger.warning(f"PyMuPDF Tier A failed ({err_a}). Trying Tier B (standard garbage collection)...")

    # Tier B: Try without clean=True (avoids 'not a dict' stream errors)
    try:
        logger.info("PyMuPDF Tier B: Attempting garbage collection without clean flag...")
        doc.save(output_path, garbage=3, deflate=True)
        doc.close()
        task_manager.update_task(task_id, "PROCESSING", 90)
        logger.info(f"PyMuPDF Tier B repair succeeded for task {task_id}")
        return output_path
    except Exception as err_b:
        logger.warning(f"PyMuPDF Tier B failed ({err_b}). Trying Tier C (page-by-page document reconstruction)...")

    # Tier C: Rebuild a brand new PDF document page-by-page
    try:
        logger.info("PyMuPDF Tier C: Rebuilding fresh PDF document and salvaging readable pages...")
        new_doc = fitz.open()
        
        salvaged_count = 0
        for i in range(len(doc)):
            try:
                new_doc.insert_pdf(doc, from_page=i, to_page=i)
                salvaged_count += 1
            except Exception as page_err:
                logger.warning(f"Could not copy page {i}: {page_err}")
                
        if salvaged_count == 0:
            raise RuntimeError("No readable pages could be salvaged from the corrupted PDF file.")

        new_doc.save(output_path, garbage=4, deflate=True)
        new_doc.close()
        doc.close()

        task_manager.update_task(task_id, "PROCESSING", 90)
        logger.info(f"PyMuPDF Tier C repair salvaged {salvaged_count} pages for task {task_id}")
        return output_path
    except Exception as err_c:
        if doc:
            doc.close()
        logger.error(f"All PDF repair tiers failed for task {task_id}: {err_c}")
        raise RuntimeError(f"PDF Repair failed: Unable to parse or salvage PDF structure ({str(err_c)})")
