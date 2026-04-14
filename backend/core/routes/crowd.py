from typing import Literal

from fastapi import APIRouter
from pydantic import BaseModel


router = APIRouter(tags=["Crowd"])


class CrowdInput(BaseModel):
    route_name: str
    crowd_level: Literal["low", "medium", "high"]


crowd_reports: list[CrowdInput] = []


@router.post("/crowd")
def add_crowd_report(payload: CrowdInput) -> dict[str, str | int]:
    crowd_reports.append(payload)
    return {
        "message": "Crowd report stored",
        "route_name": payload.route_name,
        "crowd_level": payload.crowd_level,
        "total_reports": len(crowd_reports),
    }
