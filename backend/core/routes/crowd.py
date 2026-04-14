from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from .store import add_crowd_report as store_crowd_report


router = APIRouter(tags=["Crowd"])


class CrowdInput(BaseModel):
    route_name: str
    crowd_level: Literal["low", "medium", "high"]


@router.post("/crowd")
def add_crowd_report(payload: CrowdInput) -> dict[str, str | int]:
    total_reports = store_crowd_report(payload.route_name, payload.crowd_level)
    return {
        "message": "Crowd report stored",
        "route_name": payload.route_name.strip(),
        "crowd_level": payload.crowd_level,
        "total_reports": total_reports,
    }
