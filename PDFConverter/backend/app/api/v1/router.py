from fastapi import APIRouter
from app.api.v1 import convert, repair, tasks

api_router = APIRouter()

api_router.include_router(convert.router, tags=["Conversion"])
api_router.include_router(repair.router, tags=["Repair"])
api_router.include_router(tasks.router, tags=["Tasks & Downloads"])
