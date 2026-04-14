from fastapi import APIRouter

from .alerts import router as alerts_router
from .buses import router as buses_router
from .crowd import router as crowd_router
from .dashboard import router as dashboard_router
from .fleet import router as fleet_router
from .health import router as health_router
from .stats import router as stats_router
from .suggest import router as suggest_router


api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(buses_router)
api_router.include_router(crowd_router)
api_router.include_router(suggest_router)
api_router.include_router(stats_router)
api_router.include_router(alerts_router)
api_router.include_router(fleet_router)
api_router.include_router(dashboard_router)
