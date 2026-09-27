import os
import logging
import re
from pathlib import Path
from typing import Optional

logger = logging.getLogger("PDFConverter.ImageToText")

# ──────────────────────────────────────────────
# Optional heavy imports (gracefully degrade)
# ──────────────────────────────────────────────
try:
    import cv2
    import numpy as np
    HAS_CV2 = True
except ImportError:
    HAS_CV2 = False
    logger.warning("OpenCV not available – image preprocessing disabled")

try:
    from PIL import Image
    HAS_PIL = True
except ImportError:
    HAS_PIL = False

try:
    import pytesseract
    from pytesseract import Output
    HAS_TESSERACT = True
except ImportError:
    HAS_TESSERACT = False
    logger.warning("pytesseract not installed")

try:
    from pdf2image import convert_from_path
    HAS_PDF2IMAGE = True
except ImportError:
    HAS_PDF2IMAGE = False
    logger.warning("pdf2image not installed – PDF input disabled")

try:
    from docx import Document
    from docx.shared import Pt, Inches, RGBColor
    from docx.enum.text import WD_ALIGN_PARAGRAPH
    from docx.enum.table import WD_ALIGN_VERTICAL
    HAS_DOCX = True
except ImportError:
    HAS_DOCX = False


# ──────────────────────────────────────────────
# Image pre-processing for sharpest OCR output
# ──────────────────────────────────────────────

def _preprocess_image(pil_image: "Image.Image") -> "Image.Image":
    """
    Apply a series of image enhancements to maximise Tesseract accuracy:
      1. Convert to grayscale
      2. Upscale small images (Tesseract performs best ≥ 300 DPI)
      3. CLAHE contrast enhancement
      4. Bilateral noise removal (preserves edges / text outlines)
      5. Adaptive threshold → binary
      6. Mild unsharp mask for extra crispness
    """
    if not HAS_CV2 or not HAS_PIL:
        return pil_image

    img = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2GRAY)

    # Upscale if image is small
    h, w = img.shape
    if max(h, w) < 1800:
        scale = 2.0
        img = cv2.resize(img, (int(w * scale), int(h * scale)), interpolation=cv2.INTER_CUBIC)

    # CLAHE for local contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    img = clahe.apply(img)

    # Bilateral filter – removes noise while preserving text edges
    img = cv2.bilateralFilter(img, 9, 75, 75)

    # Adaptive threshold → clean binary image
    img = cv2.adaptiveThreshold(
        img, 255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY, 31, 10
    )

    # Unsharp mask
    blurred = cv2.GaussianBlur(img, (0, 0), 3)
    img = cv2.addWeighted(img, 1.5, blurred, -0.5, 0)

    return Image.fromarray(img)


# ──────────────────────────────────────────────
# Table / attendance-form detection
# ──────────────────────────────────────────────

def _detect_table_regions(pil_image: "Image.Image"):
    """
    Returns a list of (x, y, w, h) bounding boxes for table-like structures
    detected via horizontal/vertical line morphology.
    """
    if not HAS_CV2:
        return []

    gray = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2GRAY)
    _, binary = cv2.threshold(gray, 180, 255, cv2.THRESH_BINARY_INV)

    # Detect horizontal lines
    h_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (40, 1))
    h_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, h_kernel)

    # Detect vertical lines
    v_kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 40))
    v_lines = cv2.morphologyEx(binary, cv2.MORPH_OPEN, v_kernel)

    # Combine
    grid = cv2.add(h_lines, v_lines)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
    grid = cv2.dilate(grid, kernel, iterations=2)

    contours, _ = cv2.findContours(grid, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    regions = []
    img_area = gray.shape[0] * gray.shape[1]
    for c in contours:
        x, y, w, h = cv2.boundingRect(c)
        area = w * h
        if area > img_area * 0.01 and w > 60 and h > 40:
            regions.append((x, y, w, h))

    return regions


def _extract_table_from_region(pil_image: "Image.Image", region):
    """
    Given a detected table bounding box, run Tesseract in TSV mode
    to extract cell-level text, then reconstruct a 2-D grid.
    Returns list[list[str]] or None.
    """
    if not HAS_TESSERACT or not HAS_PIL:
        return None

    x, y, w, h = region
    crop = pil_image.crop((x, y, x + w, y + h))
    processed = _preprocess_image(crop)

    data = pytesseract.image_to_data(processed, output_type=Output.DICT, config="--psm 6")

    # Group words into rows by (block_num, par_num, line_num)
    rows: dict = {}
    for i, word in enumerate(data["text"]):
        word = word.strip()
        if not word:
            continue
        key = (data["block_num"][i], data["par_num"][i], data["line_num"][i])
        rows.setdefault(key, []).append(word)

    if not rows:
        return None

    return [" ".join(words) for words in rows.values()]


# ──────────────────────────────────────────────
# Core per-page extractor
# ──────────────────────────────────────────────

def _extract_page(pil_image: "Image.Image", language: str = "eng") -> dict:
    """
    Returns {
      "full_text": str,
      "tables": list[list[str]],   # each table is a list of row-text strings
      "is_attendance_form": bool
    }
    """
    if not HAS_TESSERACT or not HAS_PIL:
        raise RuntimeError("pytesseract / Pillow not installed")

    # Detect table regions before preprocessing (preprocessing changes pixel values)
    table_regions = _detect_table_regions(pil_image)

    # Preprocess full image for text extraction
    processed = _preprocess_image(pil_image)

    # Full-page OCR
    config = f"--oem 3 --psm 6 -l {language}"
    full_text = pytesseract.image_to_string(processed, config=config)

    # Extract table data from each region
    tables = []
    for region in table_regions:
        rows = _extract_table_from_region(pil_image, region)
        if rows:
            tables.append(rows)

    # Heuristic: attendance form detection
    keywords = ["name", "signature", "date", "attendance", "present", "absent",
                "s/n", "s.n", "no.", "student", "employee", "roll", "reg"]
    text_lower = full_text.lower()
    is_attendance = (
        any(kw in text_lower for kw in keywords) and
        (len(table_regions) > 0 or text_lower.count("\n") > 5)
    )

    return {
        "full_text": full_text,
        "tables": tables,
        "is_attendance_form": is_attendance,
    }


# ──────────────────────────────────────────────
# Word document builder
# ──────────────────────────────────────────────

def _add_table_to_doc(doc: "Document", rows: list[str], is_attendance: bool):
    """
    Splits each row-string into cells (tab or multiple-space separated),
    adds a formatted table to the document.
    """
    if not rows:
        return

    # Split each row into columns
    split_rows = []
    for row in rows:
        # Split on 2+ spaces or tabs
        cells = [c.strip() for c in re.split(r"\t|  +", row) if c.strip()]
        split_rows.append(cells)

    if not split_rows:
        return

    num_cols = max(len(r) for r in split_rows)
    if num_cols < 1:
        return

    table = doc.add_table(rows=len(split_rows), cols=num_cols)
    table.style = "Table Grid"

    for r_idx, row_data in enumerate(split_rows):
        row = table.rows[r_idx]
        for c_idx, cell_text in enumerate(row_data):
            if c_idx < num_cols:
                cell = row.cells[c_idx]
                cell.text = cell_text
                # Bold first row (header)
                if r_idx == 0:
                    for para in cell.paragraphs:
                        for run in para.runs:
                            run.bold = True
                            run.font.size = Pt(9)
                else:
                    for para in cell.paragraphs:
                        for run in para.runs:
                            run.font.size = Pt(9)


def _build_word_document(pages: list[dict], output_path: str):
    """
    Assembles all extracted pages into a single Word .docx document.
    Each page is a section; tables are rendered as Word tables.
    """
    if not HAS_DOCX:
        raise RuntimeError("python-docx not installed")

    doc = Document()

    # Style document
    style = doc.styles["Normal"]
    style.font.name = "Calibri"
    style.font.size = Pt(11)

    for page_num, page_data in enumerate(pages):
        if page_num > 0:
            doc.add_page_break()

        full_text: str = page_data["full_text"]
        tables: list = page_data["tables"]
        is_attendance: bool = page_data["is_attendance_form"]

        # Page heading
        if len(pages) > 1:
            heading = doc.add_heading(f"Page {page_num + 1}", level=2)
            heading.alignment = WD_ALIGN_PARAGRAPH.LEFT

        # Attendance form banner
        if is_attendance:
            notice = doc.add_paragraph()
            run = notice.add_run("⚑ Attendance / Registration Form Detected")
            run.bold = True
            run.font.color.rgb = RGBColor(0x1D, 0x6F, 0x42)  # dark green
            run.font.size = Pt(10)
            doc.add_paragraph()

        # Render tables first (they're structural)
        if tables:
            for table_rows in tables:
                _add_table_to_doc(doc, table_rows, is_attendance)
                doc.add_paragraph()  # spacing after table

        # Remaining prose text
        # Strip out lines that are likely just table noise if tables were found
        lines = full_text.splitlines()
        prose_lines = []
        for line in lines:
            stripped = line.strip()
            if not stripped:
                prose_lines.append("")
                continue
            # Skip lines that are purely punctuation/box-drawing (table artifacts)
            if re.fullmatch(r"[|+\-=_\s]+", stripped):
                continue
            prose_lines.append(stripped)

        # Write prose
        paragraph_buffer = []
        for line in prose_lines:
            if line:
                paragraph_buffer.append(line)
            else:
                if paragraph_buffer:
                    doc.add_paragraph(" ".join(paragraph_buffer))
                    paragraph_buffer = []
        if paragraph_buffer:
            doc.add_paragraph(" ".join(paragraph_buffer))

    doc.save(output_path)
    logger.info(f"Word document saved: {output_path}")


# ──────────────────────────────────────────────
# Public pipeline entry point
# ──────────────────────────────────────────────

def run_image_to_text_pipeline(
    input_path: str,
    output_path: str,
    language: str = "eng",
    dpi: int = 300,
) -> bool:
    """
    Main entry point.
    - input_path: path to an image (PNG/JPG/BMP/TIFF/WEBP) or PDF
    - output_path: desired .docx output path
    - language: Tesseract language string (e.g. 'eng', 'eng+fra')
    - dpi: PDF render DPI (higher = sharper, slower)
    Returns True on success, False on failure.
    """
    if not HAS_TESSERACT:
        logger.error("pytesseract is not installed")
        return False
    if not HAS_DOCX:
        logger.error("python-docx is not installed")
        return False

    input_path = str(input_path)
    ext = Path(input_path).suffix.lower()

    pages_pil: list["Image.Image"] = []

    try:
        if ext == ".pdf":
            if not HAS_PDF2IMAGE:
                logger.error("pdf2image not installed – cannot process PDF input")
                return False
            logger.info(f"Converting PDF to images at {dpi} DPI: {input_path}")
            pages_pil = convert_from_path(input_path, dpi=dpi, fmt="jpeg")
        else:
            if not HAS_PIL:
                logger.error("Pillow not installed")
                return False
            img = Image.open(input_path).convert("RGB")
            pages_pil = [img]

        logger.info(f"Processing {len(pages_pil)} page(s) through OCR pipeline")
        extracted_pages = []
        for i, page_img in enumerate(pages_pil):
            logger.info(f"  → OCR page {i + 1}/{len(pages_pil)}")
            page_data = _extract_page(page_img, language=language)
            extracted_pages.append(page_data)

        _build_word_document(extracted_pages, output_path)
        return True

    except Exception as e:
        logger.exception(f"Image-to-text pipeline failed: {e}")
        return False
