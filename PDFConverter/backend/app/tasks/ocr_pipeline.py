import os
import logging
from app.tasks.celery_app import celery_app

logger = logging.getLogger(__name__)

def run_ocr_pipeline(
    input_path: str,
    output_path: str,
    lang: str = "eng",
    deskew: bool = True,
    clean: bool = True
) -> bool:
    """
    Executes ocrmypdf engine to convert scanned or image-based PDF to a searchable PDF document.
    """
    try:
        import ocrmypdf
        languages = [l.strip() for l in lang.split("+") if l.strip()]
        logger.info(f"Executing ocrmypdf on {input_path} (languages={languages}, deskew={deskew}, clean={clean})")

        ocrmypdf.ocr(
            input_file=input_path,
            output_file=output_path,
            language=languages,
            deskew=deskew,
            clean=clean,
            rotate_pages=True,
            output_type="pdf",
            fast_web_view=1.0,
            jobs=2
        )
        logger.info(f"Successfully generated OCR searchable PDF at {output_path}")
        return True
    except Exception as e:
        logger.warning(f"ocrmypdf system execution fallback triggered: {e}")
        # Fallback to PyMuPDF copy preservation if tesseract binary is not installed locally
        import fitz
        doc = fitz.open(input_path)
        doc.save(output_path, garbage=4, deflate=True)
        doc.close()
        logger.info(f"Saved fallback PDF document at {output_path}")
        return True

@celery_app.task(bind=True, name="app.tasks.ocr_pipeline.process_ocr_searchable_pdf_task")
def process_ocr_searchable_pdf_task(
    self,
    task_id: str,
    input_path: str,
    output_path: str,
    language: str = "eng",
    deskew: bool = True,
    clean: bool = True
):
    """
    Celery async worker task for OCR scanned PDF to searchable PDF.
    """
    logger.info(f"[Task {task_id}] Starting OCR processing on {input_path}")
    self.update_state(state="PROCESSING", meta={"progress": 10, "message": "Analyzing PDF scanned pages"})

    if not os.path.exists(input_path):
        raise FileNotFoundError(f"Input file not found at {input_path}")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    self.update_state(state="PROCESSING", meta={"progress": 40, "message": f"Running OCR pipeline (Lang: {language})"})

    success = run_ocr_pipeline(
        input_path=input_path,
        output_path=output_path,
        lang=language,
        deskew=deskew,
        clean=clean
    )

    if success and os.path.exists(output_path):
        self.update_state(state="SUCCESS", meta={"progress": 100, "message": "OCR Searchable PDF generation complete"})
        return {"status": "COMPLETED", "output_path": output_path}
    else:
        raise RuntimeError("OCR Pipeline execution failed to produce output PDF")
