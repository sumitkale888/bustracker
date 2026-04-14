from threading import Lock
from typing import Literal, TypedDict
from datetime import datetime


class CrowdReport(TypedDict):
    route_name: str
    crowd_level: Literal["low", "medium", "high"]
    reported_at: str
    reported_hour: int


crowd_reports: list[CrowdReport] = []
crowd_reports_lock = Lock()


def _normalize_route_name(route_name: str) -> str:
    return route_name.strip().casefold()


def add_crowd_report(route_name: str, crowd_level: Literal["low", "medium", "high"]) -> int:
    now = datetime.now()
    report: CrowdReport = {
        "route_name": route_name.strip(),
        "crowd_level": crowd_level,
        "reported_at": now.isoformat(timespec="seconds"),
        "reported_hour": now.hour,
    }
    with crowd_reports_lock:
        crowd_reports.append(report)
        return len(crowd_reports)


def get_latest_crowd_level_for_route(route_name: str) -> Literal["low", "medium", "high"] | None:
    target = _normalize_route_name(route_name)
    with crowd_reports_lock:
        for report in reversed(crowd_reports):
            if _normalize_route_name(report["route_name"]) == target:
                return report["crowd_level"]
    return None


def list_crowd_reports(route_name: str) -> list[CrowdReport]:
    target = _normalize_route_name(route_name)
    with crowd_reports_lock:
        return [report for report in crowd_reports if _normalize_route_name(report["route_name"]) == target]
