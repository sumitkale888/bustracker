from typing import Literal

from fastapi import APIRouter, Query

from .store import crowd_reports


router = APIRouter(tags=["Suggestions"])


def suggestion_for_level(level: Literal["low", "medium", "high"]) -> str:
    if level == "high":
        return "Add bus"
    if level == "medium":
        return "No change"
    return "Reduce bus"


@router.get("/suggest")
def suggest_bus_action(route_name: str = Query(..., min_length=1)) -> dict[str, str]:
    matching_reports = [report for report in crowd_reports if report["route_name"] == route_name]

    if not matching_reports:
        return {"action": "No change"}

    latest_level = matching_reports[-1]["crowd_level"]
    return {"action": suggestion_for_level(latest_level)}
