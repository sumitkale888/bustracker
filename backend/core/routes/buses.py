from time import time

from fastapi import APIRouter


router = APIRouter(tags=["Buses"])


ROUTE_PATHS: dict[str, list[tuple[float, float]]] = {
    "Swargate to Hinjewadi": [
        (18.5016, 73.8624),
        (18.5166, 73.8562),
        (18.5384, 73.8364),
        (18.5616, 73.8073),
        (18.5856, 73.7765),
        (18.5912, 73.7389),
    ],
    "Katraj to Shivajinagar": [
        (18.4575, 73.8688),
        (18.4778, 73.8573),
        (18.4987, 73.8508),
        (18.5124, 73.8468),
        (18.5301, 73.8478),
    ],
    "Hadapsar to Pune Station": [
        (18.5089, 73.9260),
        (18.5166, 73.9076),
        (18.5237, 73.8937),
        (18.5286, 73.8740),
    ],
}

BUS_CONFIG = [
    {"id": 1, "route_name": "Swargate to Hinjewadi", "phase": 0.0},
    {"id": 2, "route_name": "Swargate to Hinjewadi", "phase": 4.0},
    {"id": 3, "route_name": "Katraj to Shivajinagar", "phase": 1.0},
    {"id": 4, "route_name": "Katraj to Shivajinagar", "phase": 3.0},
    {"id": 5, "route_name": "Hadapsar to Pune Station", "phase": 0.5},
    {"id": 6, "route_name": "Hadapsar to Pune Station", "phase": 2.5},
]

STEP_SECONDS = 3.0


def interpolate_point(start: tuple[float, float], end: tuple[float, float], ratio: float) -> tuple[float, float]:
    lat = start[0] + (end[0] - start[0]) * ratio
    lng = start[1] + (end[1] - start[1]) * ratio
    return lat, lng


def moving_position(path: list[tuple[float, float]], elapsed_steps: float) -> tuple[float, float]:
    segments = len(path) - 1
    # Ping-pong movement: 0->n and n->0 for a simple back-and-forth route.
    cycle = 2 * segments
    position = elapsed_steps % cycle

    if position <= segments:
        forward_index = int(position)
        start_index = min(forward_index, segments - 1)
        end_index = min(start_index + 1, segments)
        ratio = position - forward_index
        return interpolate_point(path[start_index], path[end_index], ratio)

    backward_position = position - segments
    backward_index = int(backward_position)
    start_index = max(segments - backward_index, 1)
    end_index = start_index - 1
    ratio = backward_position - backward_index
    return interpolate_point(path[start_index], path[end_index], ratio)


@router.get("/buses")
def list_buses() -> list[dict[str, int | float | str]]:
    current_steps = time() / STEP_SECONDS
    buses: list[dict[str, int | float | str]] = []

    for config in BUS_CONFIG:
        route_name = str(config["route_name"])
        phase = float(config["phase"])
        path = ROUTE_PATHS[route_name]
        latitude, longitude = moving_position(path, current_steps + phase)

        buses.append(
            {
                "id": int(config["id"]),
                "route_name": route_name,
                "latitude": round(latitude, 6),
                "longitude": round(longitude, 6),
            }
        )

    return buses
