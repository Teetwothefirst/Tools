import uuid
import time
import asyncio
import threading
import logging
from typing import Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("PDFConverter.TaskManager")

# In-memory Task State Registry for Async Fallback Runner
IN_MEMORY_TASKS: Dict[str, Dict[str, Any]] = {}

class TaskManager:
    """
    Task Manager supporting Celery integration when Redis is available,
    with an embedded fallback in-memory background task queue when Redis/Celery is not active.
    """
    def __init__(self):
        self.use_celery = settings.USE_CELERY
        self.celery_app = None
        
        if self.use_celery:
            try:
                from celery import Celery
                self.celery_app = Celery("pdf_converter", broker=settings.REDIS_URL, backend=settings.REDIS_URL)
                self.celery_app.conf.update(
                    task_serializer='json',
                    accept_content=['json'],
                    result_serializer='json',
                    timezone='UTC',
                    enable_utc=True,
                )
                logger.info("Celery task queue initialized with Redis broker.")
            except Exception as e:
                logger.warning(f"Failed to initialize Celery ({e}). Falling back to In-Memory Task Engine.")
                self.use_celery = False

    def create_task(self) -> str:
        task_id = str(uuid.uuid4())
        IN_MEMORY_TASKS[task_id] = {
            "task_id": task_id,
            "status": "PENDING",
            "progress": 0,
            "result_file": None,
            "error": None,
            "created_at": time.time()
        }
        return task_id

    def update_task(self, task_id: str, status: str, progress: int = 0, result_file: Optional[str] = None, error: Optional[str] = None):
        if task_id in IN_MEMORY_TASKS:
            IN_MEMORY_TASKS[task_id]["status"] = status
            IN_MEMORY_TASKS[task_id]["progress"] = progress
            if result_file:
                IN_MEMORY_TASKS[task_id]["result_file"] = result_file
            if error:
                IN_MEMORY_TASKS[task_id]["error"] = error

    def get_task_status(self, task_id: str) -> Dict[str, Any]:
        if self.use_celery and self.celery_app:
            try:
                res = self.celery_app.AsyncResult(task_id)
                if res.state == 'PENDING':
                    return {"task_id": task_id, "status": "PENDING", "progress": 0, "result_file": None, "error": None}
                elif res.state == 'PROGRESS':
                    meta = res.info or {}
                    return {"task_id": task_id, "status": "PROCESSING", "progress": meta.get("progress", 50), "result_file": None, "error": None}
                elif res.state == 'SUCCESS':
                    result = res.result or {}
                    return {"task_id": task_id, "status": "SUCCESS", "progress": 100, "result_file": result.get("result_file"), "error": None}
                elif res.state == 'FAILURE':
                    return {"task_id": task_id, "status": "FAILED", "progress": 0, "result_file": None, "error": str(res.info)}
            except Exception as e:
                logger.error(f"Error querying Celery task {task_id}: {e}")

        # Fallback in-memory task status check
        return IN_MEMORY_TASKS.get(task_id, {
            "task_id": task_id,
            "status": "NOT_FOUND",
            "progress": 0,
            "result_file": None,
            "error": "Task ID not found"
        })

    def run_in_background(self, func, task_id: str, *args, **kwargs):
        """
        Executes heavy function in a background thread when Celery is not active.
        """
        def worker():
            try:
                self.update_task(task_id, "PROCESSING", 20)
                result_file = func(task_id, *args, **kwargs)
                self.update_task(task_id, "SUCCESS", 100, result_file=result_file)
            except Exception as e:
                logger.exception(f"Background execution failed for task {task_id}: {e}")
                self.update_task(task_id, "FAILED", 0, error=str(e))

        thread = threading.Thread(target=worker, daemon=True)
        thread.start()

task_manager = TaskManager()
