from fastapi import APIRouter, Query

from ..services.route_insights import route_statistics


router = APIRouter(tags=["Route Stats"])


@router.get("/route-stats")
def get_route_stats(route_name: str = Query(..., min_length=1)) -> dict[str, str | int | float | list[dict[str, str | int]]]:
    return route_statistics(route_name)
