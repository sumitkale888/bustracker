from fastapi import APIRouter

from ..services.dashboard_summary import dashboard_summary


router = APIRouter(tags=["Dashboard"])


@router.get("/dashboard-summary")
def get_dashboard_summary() -> dict[str, int | list[str] | dict[str, int] | list[dict[str, str | int]]]:
    return dashboard_summary()
