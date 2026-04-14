from fastapi import APIRouter


router = APIRouter(tags=["Buses"])


DUMMY_BUSES = [
    {"id": 1, "route_name": "Route A", "latitude": 12.9716, "longitude": 77.5946},
    {"id": 2, "route_name": "Route B", "latitude": 12.9784, "longitude": 77.6408},
    {"id": 3, "route_name": "Route C", "latitude": 12.9352, "longitude": 77.6245},
]


@router.get("/buses")
def list_buses() -> list[dict[str, int | float | str]]:
    return DUMMY_BUSES
