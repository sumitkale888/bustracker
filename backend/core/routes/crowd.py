from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel

from .store import crowd_reports


router = APIRouter(tags=["Crowd"])


class CrowdInput(BaseModel):
    route_name: str
    crowd_level: Literal["low", "medium", "high"]


@router.post("/crowd")
def add_crowd_report(payload: CrowdInput) -> dict[str, str | int]:
    crowd_reports.append({"route_name": payload.route_name, "crowd_level": payload.crowd_level})
    return {
        "message": "Crowd report stored",
        "route_name": payload.route_name,
        "crowd_level": payload.crowd_level,
        "total_reports": len(crowd_reports),
    }
