from fastapi import APIRouter

from ..services.fleet_rebalancer import rebalance_buses, route_demand_snapshot


router = APIRouter(tags=["Fleet"])


@router.get("/fleet-demand")
def get_fleet_demand() -> dict[str, list[dict[str, str | int]]]:
    return {"routes": route_demand_snapshot()}


@router.post("/fleet/rebalance")
def rebalance_fleet() -> dict[str, list[dict[str, str | int]]]:
    return rebalance_buses()
