from fastapi import APIRouter, Query

from ..services.route_insights import suggest_for_route


router = APIRouter(tags=["Suggestions"])


@router.get("/suggest")
def suggest_bus_action(route_name: str = Query(..., min_length=1)) -> dict[str, str | int]:
    return suggest_for_route(route_name)
