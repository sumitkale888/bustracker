from typing import Literal, TypedDict


class CrowdReport(TypedDict):
    route_name: str
    crowd_level: Literal["low", "medium", "high"]


crowd_reports: list[CrowdReport] = []
