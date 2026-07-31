import os
import time
import uuid
import shutil
import logging
from pathlib import Path
from typing import Optional
from app.config import settings

logger = logging.getLogger("PDFConverter.Storage")

class EphemeralStorage:
    def __init__(self):
        self.upload_dir = settings.UPLOAD_DIR
        self.output_dir = settings.OUTPUT_DIR
        self.cleanup_seconds = settings.EPHEMERAL_CLEANUP_SECONDS

    def save_upload(self, file_bytes: bytes, filename: str) -> str:
        """
        Saves uploaded file into upload_dir with a unique identifier prefix.
        Returns unique storage path string.
        """
        unique_id = uuid.uuid4().hex
        safe_name = f"{unique_id}_{filename}"
        target_path = self.upload_dir / safe_name
        
        with open(target_path, "wb") as f:
            f.write(file_bytes)
            
        return str(target_path)

    def get_output_path(self, filename: str) -> str:
        """
        Generates a unique destination path in output_dir.
        """
        unique_id = uuid.uuid4().hex
        safe_name = f"{unique_id}_{filename}"
        target_path = self.output_dir / safe_name
        return str(target_path)

    def run_cleanup_janitor(self):
        """
        Removes files older than cleanup_seconds (2 hours retention policy).
        """
        now = time.time()
        for directory in [self.upload_dir, self.output_dir]:
            if not directory.exists():
                continue
            for file_path in directory.glob("*"):
                try:
                    if file_path.is_file():
                        file_age = now - os.path.getmtime(file_path)
                        if file_age > self.cleanup_seconds:
                            os.remove(file_path)
                            logger.info(f"Ephemeral Janitor cleaned up expired file: {file_path.name}")
                except Exception as e:
                    logger.error(f"Error cleaning up file {file_path}: {e}")

storage = EphemeralStorage()
