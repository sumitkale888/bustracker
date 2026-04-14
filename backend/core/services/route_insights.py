from datetime import datetime
from typing import Literal

from ..routes.buses import get_active_bus_count
from ..routes.store import get_latest_crowd_level_for_route, list_crowd_reports

CrowdLevel = Literal["low", "medium", "high"]


def level_to_score(level: CrowdLevel) -> int:
    if level == "low":
        return 1
    if level == "medium":
        return 2
    return 3


def score_to_level(score: int) -> CrowdLevel:
    if score <= 1:
        return "low"
    if score == 2:
        return "medium"
    return "high"


def suggestion_for_level(level: CrowdLevel) -> str:
    if level == "high":
        return "Add bus"
    if level == "medium":
        return "No change"
    return "Reduce bus"


def recommended_bus_target(level: CrowdLevel) -> int:
    return {
        "high": 4,
        "medium": 2,
        "low": 1,
    }[level]


def time_slot_level(current_hour: int) -> tuple[str, CrowdLevel]:
    if 8 <= current_hour <= 11:
        return "morning", "high"
    if 17 <= current_hour <= 21:
        return "evening", "high"
    if 12 <= current_hour <= 16:
        return "afternoon", "medium"
    return "off_peak", "low"


def blended_crowd_level(route_name: str) -> dict[str, str | int]:
    current_hour = datetime.now().hour
    slot_name, slot_level = time_slot_level(current_hour)

    latest_level = get_latest_crowd_level_for_route(route_name)
    if latest_level is None:
        effective_level = slot_level
    else:
        blended_score = int(((level_to_score(latest_level) + level_to_score(slot_level)) / 2) + 0.5)
        effective_level = score_to_level(blended_score)

    return {
        "user_crowd_level": latest_level or "not_available",
        "time_based_crowd_level": slot_level,
        "effective_crowd_level": effective_level,
        "time_slot": slot_name,
        "current_hour": current_hour,
    }


def suggest_for_route(route_name: str) -> dict[str, str | int]:
    crowd_data = blended_crowd_level(route_name)
    effective_level = crowd_data["effective_crowd_level"]
    if effective_level not in {"low", "medium", "high"}:
        effective_level = "medium"
    active_buses = get_active_bus_count(route_name)

    target_buses = recommended_bus_target(effective_level)

    if active_buses < target_buses:
        action = "Add bus"
    elif active_buses > target_buses:
        action = "Reduce bus"
    else:
        action = "No change"

    high_demand_alert = effective_level == "high" and action in {"Add bus", "No change"}
    alert_message = "High demand detected, additional buses required" if high_demand_alert else ""

    return {
        "action": action,
        "active_buses": active_buses,
        "recommended_buses": target_buses,
        "shortage": max(target_buses - active_buses, 0),
        "surplus": max(active_buses - target_buses, 0),
        "high_demand_alert": high_demand_alert,
        "alert_message": alert_message,
        **crowd_data,
    }


def route_statistics(route_name: str) -> dict[str, str | int | float | list[dict[str, str | int]]]:
    reports = list_crowd_reports(route_name)
    active_buses = get_active_bus_count(route_name)

    if reports:
        avg_score = sum(level_to_score(report["crowd_level"]) for report in reports) / len(reports)
        avg_crowd = score_to_level(int(round(avg_score)))
    else:
        avg_score = 2.0
        avg_crowd = "medium"

    trend_counts = {
        "morning": 0,
        "afternoon": 0,
        "evening": 0,
        "off_peak": 0,
    }
    for report in reports:
        hour = int(report["reported_hour"])
        slot, _ = time_slot_level(hour)
        trend_counts[slot] += 1

    peak_slot = max(trend_counts, key=trend_counts.get)

    peak_trends = [
        {"slot": key, "reports": value}
        for key, value in trend_counts.items()
    ]

    return {
        "route_name": route_name,
        "active_buses": active_buses,
        "average_crowd_level": avg_crowd,
        "average_crowd_score": round(avg_score, 2),
        "total_reports": len(reports),
        "peak_time_slot": peak_slot,
        "peak_trends": peak_trends,
    }
