from fastapi import APIRouter, Query

from ..services.route_insights import suggest_for_route


router = APIRouter(tags=["Alerts"])


@router.get("/alerts")
def get_alerts(route_name: str = Query(..., min_length=1)) -> dict[str, str | bool | int]:
    suggestion = suggest_for_route(route_name)
    return {
        "route_name": route_name,
        "high_demand_alert": bool(suggestion["high_demand_alert"]),
        "message": str(suggestion["alert_message"]),
        "active_buses": int(suggestion["active_buses"]),
        "recommended_buses": int(suggestion["recommended_buses"]),
        "shortage": int(suggestion["shortage"]),
    }
