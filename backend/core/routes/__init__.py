from fastapi import APIRouter

from .buses import router as buses_router
from .crowd import router as crowd_router
from .health import router as health_router
from .suggest import router as suggest_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(buses_router)
api_router.include_router(crowd_router)
api_router.include_router(suggest_router)
