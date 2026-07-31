# PDFConverter - Scalable PDF Manipulation & Document Processing Platform

A full-stack web application for browser-side and server-side PDF manipulation, document conversion, and file repair (similar to Smallpdf / ILovePDF).

## 🚀 Features

- **Feature A: Client-Side PDF Merger & Visual Page Organizer (`/merge`)**
  - High performance browser-side rendering using `pdfjs-dist`.
  - Visual page thumbnail grid with rotation, page removal, and drag/button re-ordering.
  - Pure client-side PDF merging & export using `pdf-lib` without server upload.

- **Feature B: PDF to Word Converter (`/pdf-to-word`)**
  - Server-side parsing of layout, tables, graphics, and text using `pdf2docx`.

- **Feature C: Word to PDF Converter (`/word-to-pdf`)**
  - High fidelity conversion of `.docx`/`.doc` into standard PDF format using headless LibreOffice (`soffice`).

- **Feature D: PDF Repair Utility (`/repair`)**
  - Recovery of corrupted cross-reference (XRef) tables, broken stream headers, and invalid objects using `Ghostscript` (`gs`) with `PyMuPDF` (`fitz`) fallback.

- **Security & Ephemeral Storage:**
  - Strict 300MB maximum file upload cap.
  - Zero-retention policy with an automated background janitor cleaning up files after 2 hours.
  - Path traversal and filename sanitization (`secure_filename`).

---

## 📁 Repository Structure

```
PDFConverter/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Endpoints for conversion, repair, and task status polling
│   │   ├── core/            # Security, filename sanitization, ephemeral storage manager
│   │   ├── tasks/           # Celery / background async task engine & conversion handlers
│   │   ├── config.py        # Configuration (300MB caps, storage paths, retention)
│   │   └── main.py          # FastAPI application entry point with CORS middleware
│   ├── run_backend.py       # Uvicorn launcher script
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (/merge, /pdf-to-word, /word-to-pdf, /repair)
│   │   ├── components/      # UI components (Header, DropZone, PdfViewerGrid, TaskProgressModal)
│   │   └── lib/             # Browser engines (pdf-lib, pdfjs-dist) & API client
│   └── package.json
└── README.md
```

---

## 🛠️ How to Run Locally

### 1. Start the Backend API (FastAPI)

```bash
cd backend

# Create & activate Python virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
# source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run backend service
python run_backend.py
```

The FastAPI backend will start on `http://localhost:8000`. You can inspect interactive API documentation at `http://localhost:8000/docs`.

### 2. Start the Frontend (Next.js)

```bash
cd frontend

# Install Node dependencies
npm install

# Start development server
npm run dev
```

The Next.js frontend will start on `http://localhost:3000`.

---

## 📋 System Requirements for Heavy Server Conversions

- **LibreOffice**: Install LibreOffice (`soffice`) for Word to PDF conversions.
- **Ghostscript**: Install Ghostscript (`gs` / `gswin64c`) for advanced PDF repairs.
