from ..routes.buses import list_route_names
from .route_insights import suggest_for_route


def dashboard_summary() -> dict[str, int | list[str] | dict[str, int] | list[dict[str, str | int]]]:
    route_names = list_route_names()
    recommendations: list[dict[str, str | int]] = []

    crowd_counts = {
        "high": 0,
        "medium": 0,
        "low": 0,
    }

    total_buses = 0
    for route_name in route_names:
        suggestion = suggest_for_route(route_name)
        total_buses += int(suggestion["active_buses"])
        level = str(suggestion["effective_crowd_level"])
        if level in crowd_counts:
            crowd_counts[level] += 1

        recommendations.append(
            {
                "route_name": route_name,
                "action": str(suggestion["action"]),
                "active_buses": int(suggestion["active_buses"]),
                "recommended_buses": int(suggestion["recommended_buses"]),
            }
        )

    return {
        "total_buses": total_buses,
        "active_routes": len(route_names),
        "route_names": route_names,
        "crowd_levels": crowd_counts,
        "recommendations": recommendations,
    }
