import os
from pathlib import Path
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import FileResponse
from app.tasks.celery_app import task_manager
from app.config import settings

router = APIRouter()

@router.get("/tasks/{task_id}")
def get_task_status(task_id: str):
    """
    Poll conversion/repair task status (0-100% progress, PENDING, PROCESSING, SUCCESS, FAILED).
    Returns temporary download URL upon completion.
    """
    task_info = task_manager.get_task_status(task_id)
    
    if task_info["status"] == "NOT_FOUND":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Requested task_id was not found."
        )

    download_url = None
    if task_info["status"] == "SUCCESS" and task_info.get("result_file"):
        filename = os.path.basename(task_info["result_file"])
        download_url = f"{settings.API_V1_STR}/download/{filename}"

    return {
        "task_id": task_id,
        "status": task_info["status"],
        "progress": task_info["progress"],
        "download_url": download_url,
        "error": task_info.get("error")
    }

@router.get("/download/{filename}")
def download_file(filename: str):
    """
    Serve converted output file for download.
    """
    file_path = settings.OUTPUT_DIR / filename
    
    if not file_path.exists() or not file_path.is_file():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File has expired or does not exist."
        )

    # Clean display name (strip unique uuid prefix if present)
    display_name = filename
    if "_" in filename:
        display_name = filename.split("_", 1)[1]

    return FileResponse(
        path=str(file_path),
        filename=display_name,
        media_type="application/octet-stream"
    )
