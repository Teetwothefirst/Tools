import re
import os
import unicodedata
from fastapi import HTTPException, status, UploadFile
from app.config import settings

def secure_filename(filename: str) -> str:
    """
    Sanitize filename to prevent path traversal and shell injection vulnerabilities.
    """
    if not filename:
        return "unnamed_file"
    
    # Normalize unicode characters
    filename = unicodedata.normalize('NFKD', filename)
    filename = filename.encode('ascii', 'ignore').decode('ascii')
    
    # Extract basename only (remove path prefixes)
    filename = os.path.basename(filename)
    
    # Keep only safe characters: alphanumeric, dashes, underscores, dots
    filename = re.sub(r'[^a-zA-Z0-9._-]', '_', filename)
    
    # Avoid leading dots / empty filenames
    filename = filename.lstrip('.')
    if not filename:
        return "unnamed_file"
        
    return filename

def validate_file_size(file: UploadFile, max_bytes: int = settings.MAX_FILE_SIZE_BYTES):
    """
    Validate that the uploaded file size does not exceed max_bytes (default 300MB).
    """
    if file.size and file.size > max_bytes:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"File size exceeds maximum allowed limit of {max_bytes // (1024 * 1024)}MB."
        )
