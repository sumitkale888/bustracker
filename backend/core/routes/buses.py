from math import asin, cos, pi, sin, sqrt
from datetime import datetime
from threading import Lock
from time import time
from urllib.error import HTTPError, URLError
from urllib.request import urlopen

import json

from fastapi import APIRouter, Query


router = APIRouter(tags=["Buses"])


ROUTE_ANCHORS: dict[str, list[tuple[float, float]]] = {
    "Route A": [
        (18.5204, 73.8567),
        (18.5310, 73.8440),
        (18.5420, 73.8300),
    ],
    "Route B": [
        (18.5074, 73.8077),
        (18.5150, 73.8200),
        (18.5300, 73.8350),
    ],
}

OSRM_BASE_URL = "https://router.project-osrm.org/route/v1/driving"
OSRM_TIMEOUT_SECONDS = 8


def stop_name(route_name: str, stop_index: int) -> str:
    return f"{route_name} Stop {stop_index + 1}"


def build_intermediate_leg(
    start: tuple[float, float],
    end: tuple[float, float],
    points_per_leg: int,
    curvature: float,
) -> list[tuple[float, float]]:
    lat1, lon1 = start
    lat2, lon2 = end
    delta_lat = lat2 - lat1
    delta_lon = lon2 - lon1

    # Use a sinusoidal offset on the perpendicular axis to avoid perfectly straight segments.
    perp_lat = -delta_lon
    perp_lon = delta_lat

    intermediate: list[tuple[float, float]] = []
    for step in range(points_per_leg):
        t = step / points_per_leg
        base_lat = lat1 + delta_lat * t
        base_lon = lon1 + delta_lon * t

        wave = sin(t * pi) * curvature
        lat = base_lat + (perp_lat * wave)
        lon = base_lon + (perp_lon * wave)
        intermediate.append((round(lat, 6), round(lon, 6)))

    return intermediate


def build_route_path(anchor_points: list[tuple[float, float]], points_per_leg: int, curvature: float) -> list[tuple[float, float]]:
    expanded: list[tuple[float, float]] = []
    for index in range(len(anchor_points) - 1):
        start = anchor_points[index]
        end = anchor_points[index + 1]
        expanded.extend(build_intermediate_leg(start, end, points_per_leg, curvature))

    expanded.append((round(anchor_points[-1][0], 6), round(anchor_points[-1][1], 6)))
    return expanded


def fetch_osrm_leg(start: tuple[float, float], end: tuple[float, float]) -> list[tuple[float, float]]:
    start_lat, start_lng = start
    end_lat, end_lng = end
    url = (
        f"{OSRM_BASE_URL}/"
        f"{start_lng},{start_lat};{end_lng},{end_lat}"
        "?overview=full&geometries=geojson"
    )

    try:
        with urlopen(url, timeout=OSRM_TIMEOUT_SECONDS) as response:
            payload = json.loads(response.read().decode("utf-8"))
    except (HTTPError, URLError, TimeoutError, json.JSONDecodeError, ValueError):
        return []

    routes = payload.get("routes")
    if not routes:
        return []

    coordinates = routes[0].get("geometry", {}).get("coordinates", [])
    leg_points: list[tuple[float, float]] = []
    for item in coordinates:
        if not isinstance(item, list) or len(item) != 2:
            continue
        lng, lat = item
        leg_points.append((round(float(lat), 6), round(float(lng), 6)))

    return leg_points


def build_osrm_route_path(route_name: str, anchor_points: list[tuple[float, float]]) -> list[tuple[float, float]]:
    route_points: list[tuple[float, float]] = []

    for index in range(len(anchor_points) - 1):
        start = anchor_points[index]
        end = anchor_points[index + 1]
        leg_points = fetch_osrm_leg(start, end)

        # Fallback keeps app functional if OSRM is unavailable.
        if not leg_points:
            leg_points = build_route_path([start, end], points_per_leg=8, curvature=0.15)

        if route_points and leg_points and route_points[-1] == leg_points[0]:
            leg_points = leg_points[1:]

        route_points.extend(leg_points)

    if not route_points:
        return build_route_path(anchor_points, points_per_leg=8, curvature=0.15)

    return route_points


def build_osrm_route_with_stops(route_name: str, anchor_points: list[tuple[float, float]]) -> tuple[list[tuple[float, float]], list[dict[str, int | str]]]:
    route_points: list[tuple[float, float]] = []
    route_stops: list[dict[str, int | str]] = []

    for index in range(len(anchor_points) - 1):
        start = anchor_points[index]
        end = anchor_points[index + 1]
        leg_points = fetch_osrm_leg(start, end)

        if not leg_points:
            leg_points = build_route_path([start, end], points_per_leg=8, curvature=0.15)

        if route_points and leg_points and route_points[-1] == leg_points[0]:
            leg_points = leg_points[1:]

        if index == 0:
            route_stops.append({"name": stop_name(route_name, 0), "path_index": 0})

        route_points.extend(leg_points)
        route_stops.append({"name": stop_name(route_name, index + 1), "path_index": len(route_points) - 1})

    if not route_points:
        route_points = build_route_path(anchor_points, points_per_leg=8, curvature=0.15)
        route_stops = [
            {"name": stop_name(route_name, idx), "path_index": min(idx * max(len(route_points) // len(anchor_points), 1), len(route_points) - 1)}
            for idx in range(len(anchor_points))
        ]

    return route_points, route_stops


ROUTES: dict[str, list[tuple[float, float]]] = {}
ROUTE_STOPS: dict[str, list[dict[str, int | str]]] = {}
for route_name, anchor_points in ROUTE_ANCHORS.items():
    route_points, route_stops = build_osrm_route_with_stops(route_name, anchor_points)
    ROUTES[route_name] = route_points
    ROUTE_STOPS[route_name] = route_stops


def initial_bus_state(route_name: str, current_index: int) -> dict[str, float | int | str]:
    return {
        "route_name": route_name,
        "current_index": current_index,
        "last_update_ts": time(),
    }


def distributed_indices(route_name: str, bus_count: int) -> list[int]:
    route_length = len(ROUTES[route_name])
    step = max(route_length // bus_count, 1)
    return [(offset * step) % route_length for offset in range(bus_count)]


def build_bus_states() -> dict[int, dict[str, float | int | str]]:
    bus_states: dict[int, dict[str, float | int | str]] = {}
    next_bus_id = 1

    for route_name, bus_count in (("Route A", 3), ("Route B", 3)):
        for current_index in distributed_indices(route_name, bus_count):
            bus_states[next_bus_id] = initial_bus_state(route_name, current_index)
            next_bus_id += 1

    return bus_states


BUS_STATES: dict[int, dict[str, float | int | str]] = build_bus_states()
BUS_STATE_LOCK = Lock()


def get_active_bus_count(route_name: str) -> int:
    with BUS_STATE_LOCK:
        return sum(1 for state in BUS_STATES.values() if str(state["route_name"]) == route_name)


def list_route_names() -> list[str]:
    return list(ROUTES.keys())


def list_active_bus_ids(route_name: str) -> list[int]:
    with BUS_STATE_LOCK:
        return [bus_id for bus_id, state in BUS_STATES.items() if str(state["route_name"]) == route_name]


def reassign_bus(bus_id: int, to_route_name: str) -> bool:
    if to_route_name not in ROUTES:
        return False

    with BUS_STATE_LOCK:
        if bus_id not in BUS_STATES:
            return False

        target_route_length = len(ROUTES[to_route_name])
        current_target_count = sum(1 for state in BUS_STATES.values() if str(state["route_name"]) == to_route_name)
        target_index = (current_target_count * max(target_route_length // 3, 1)) % target_route_length

        BUS_STATES[bus_id]["route_name"] = to_route_name
        BUS_STATES[bus_id]["current_index"] = target_index
        BUS_STATES[bus_id]["last_update_ts"] = time()
        return True

STEP_SECONDS = 3.0
MAX_HISTORY = 20

TELEMETRY_HISTORY: dict[str, dict[str, list[float]]] = {
    route_name: {"speed": [], "load": []}
    for route_name in ROUTES
}
TELEMETRY_HISTORY["__all__"] = {"speed": [], "load": []}


def update_bus_index(state: dict[str, float | int | str], route_length: int, now_ts: float) -> None:
    current_index = int(state["current_index"])
    last_update_ts = float(state["last_update_ts"])
    elapsed_seconds = now_ts - last_update_ts

    if elapsed_seconds < STEP_SECONDS:
        return

    steps = int(elapsed_seconds // STEP_SECONDS)
    state["current_index"] = (current_index + steps) % route_length
    state["last_update_ts"] = last_update_ts + (steps * STEP_SECONDS)


def clamp(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def compute_bus_speed(bus_id: int, current_index: int, route_name: str) -> float:
    hour = datetime.now().hour
    route_bias = 1.0 if route_name == "Route A" else -1.0
    speed = 31 + route_bias + (bus_id % 4) * 2 + ((current_index % 7) - 3) * 1.8
    if bus_id % 3 == 0:
        speed -= 4

    # Peak traffic hours reduce speed; low-traffic hours allow faster movement.
    if 8 <= hour <= 11 or 17 <= hour <= 21:
        speed *= 0.72
    elif 12 <= hour <= 16:
        speed *= 0.9
    else:
        speed *= 1.12

    return clamp(speed, 18, 52)


def compute_bus_load(bus_id: int, current_index: int, route_name: str) -> float:
    route_bias = 8 if route_name == "Route A" else 3
    load = 45 + route_bias + (bus_id % 2) * 7 + ((current_index % 9) - 4) * 2.5
    return clamp(load, 20, 95)


def haversine_km(start: tuple[float, float], end: tuple[float, float]) -> float:
    lat1, lon1 = start
    lat2, lon2 = end
    radius_km = 6371.0

    d_lat = (lat2 - lat1) * (pi / 180)
    d_lon = (lon2 - lon1) * (pi / 180)
    lat1_rad = lat1 * (pi / 180)
    lat2_rad = lat2 * (pi / 180)

    a = sin(d_lat / 2) ** 2 + cos(lat1_rad) * cos(lat2_rad) * sin(d_lon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return radius_km * c


def next_stop_for_position(route_name: str, current_index: int) -> tuple[dict[str, int | str], dict[str, int | str]]:
    stops = ROUTE_STOPS[route_name]

    current_stop = stops[-1]
    for stop in stops:
        if int(stop["path_index"]) <= current_index:
            current_stop = stop

    next_stop = stops[0]
    for stop in stops:
        if int(stop["path_index"]) > current_index:
            next_stop = stop
            break

    return current_stop, next_stop


def distance_to_next_stop_km(route_points: list[tuple[float, float]], current_index: int, next_stop_index: int) -> float:
    if current_index == next_stop_index:
        return 0.0

    total = 0.0
    idx = current_index
    while idx != next_stop_index:
        next_idx = (idx + 1) % len(route_points)
        total += haversine_km(route_points[idx], route_points[next_idx])
        idx = next_idx

    return total


def push_history(route_name: str, speed_value: float, load_value: float) -> None:
    history = TELEMETRY_HISTORY[route_name]
    history["speed"].append(round(speed_value, 1))
    history["load"].append(round(load_value, 1))

    if len(history["speed"]) > MAX_HISTORY:
        history["speed"] = history["speed"][-MAX_HISTORY:]
    if len(history["load"]) > MAX_HISTORY:
        history["load"] = history["load"][-MAX_HISTORY:]


def current_buses_snapshot(now_ts: float) -> list[dict[str, int | float | str]]:
    buses: list[dict[str, int | float | str]] = []

    with BUS_STATE_LOCK:
        for bus_id, state in BUS_STATES.items():
            route_name = str(state["route_name"])
            route_points = ROUTES[route_name]

            update_bus_index(state, len(route_points), now_ts)
            current_index = int(state["current_index"])
            latitude, longitude = route_points[current_index]
            speed_kmph = compute_bus_speed(bus_id, current_index, route_name)
            load_percent = compute_bus_load(bus_id, current_index, route_name)
            current_stop, next_stop = next_stop_for_position(route_name, current_index)
            next_stop_index = int(next_stop["path_index"])
            remaining_distance_km = distance_to_next_stop_km(route_points, current_index, next_stop_index)

            if speed_kmph <= 0:
                eta_seconds = 0
            else:
                eta_seconds = max(1, int((remaining_distance_km / speed_kmph) * 3600))
            eta_minutes = round(eta_seconds / 60, 1)

            buses.append(
                {
                    "id": int(bus_id),
                    "route_name": route_name,
                    "latitude": round(latitude, 6),
                    "longitude": round(longitude, 6),
                    "current_stop_index": current_index,
                    "current_stop_name": str(current_stop["name"]),
                    "next_stop_index": next_stop_index,
                    "next_stop_name": str(next_stop["name"]),
                    "remaining_distance_km": round(remaining_distance_km, 3),
                    "eta_next_stop_seconds": eta_seconds,
                    "eta_next_stop_minutes": eta_minutes,
                    "speed_kmph": round(speed_kmph, 1),
                    "load_percent": round(load_percent, 1),
                }
            )

    return buses


def update_telemetry_histories(buses: list[dict[str, int | float | str]]) -> None:
    route_bucket: dict[str, dict[str, list[float]]] = {
        route_name: {"speed": [], "load": []}
        for route_name in ROUTES
    }

    for bus in buses:
        route_name = str(bus["route_name"])
        route_bucket[route_name]["speed"].append(float(bus["speed_kmph"]))
        route_bucket[route_name]["load"].append(float(bus["load_percent"]))

    all_speeds: list[float] = []
    all_loads: list[float] = []
    for route_name, values in route_bucket.items():
        if values["speed"]:
            avg_speed = sum(values["speed"]) / len(values["speed"])
            avg_load = sum(values["load"]) / len(values["load"])
            push_history(route_name, avg_speed, avg_load)
            all_speeds.extend(values["speed"])
            all_loads.extend(values["load"])

    if all_speeds:
        push_history("__all__", sum(all_speeds) / len(all_speeds), sum(all_loads) / len(all_loads))


def downsample_path(
    points: list[tuple[float, float]],
    stop_name_by_index: dict[int, str],
    step: int,
) -> list[dict[str, float | int | str]]:
    sampled: list[dict[str, float | int | str]] = []
    for index in range(0, len(points), step):
        latitude, longitude = points[index]
        sampled.append(
            {
                "index": index,
                "latitude": latitude,
                "longitude": longitude,
                "stop_name": stop_name_by_index.get(index, ""),
            }
        )

    if sampled and int(sampled[-1]["index"]) != len(points) - 1:
        latitude, longitude = points[-1]
        sampled.append(
            {
                "index": len(points) - 1,
                "latitude": latitude,
                "longitude": longitude,
                "stop_name": stop_name_by_index.get(len(points) - 1, ""),
            }
        )

    return sampled


@router.get("/routes")
def list_routes(compact: bool = Query(default=False)) -> list[dict[str, str | list[dict[str, float | int | str]]]]:
    routes: list[dict[str, str | list[dict[str, float | int | str]]]] = []

    for route_name, points in ROUTES.items():
        stop_name_by_index = {
            int(stop["path_index"]): str(stop["name"])
            for stop in ROUTE_STOPS[route_name]
        }
        if compact:
            path = downsample_path(points, stop_name_by_index, step=5)
        else:
            path = [
                {
                    "index": index,
                    "latitude": latitude,
                    "longitude": longitude,
                    "stop_name": stop_name_by_index.get(index, ""),
                }
                for index, (latitude, longitude) in enumerate(points)
            ]
        routes.append({"route_name": route_name, "path": path, "stops": ROUTE_STOPS[route_name]})

    return routes


@router.get("/buses")
def list_buses(compact: bool = Query(default=False)) -> list[dict[str, int | float | str]]:
    now_ts = time()
    buses = current_buses_snapshot(now_ts)
    update_telemetry_histories(buses)

    if compact:
        return [
            {
                "id": int(bus["id"]),
                "route_name": str(bus["route_name"]),
                "latitude": round(float(bus["latitude"]), 5),
                "longitude": round(float(bus["longitude"]), 5),
                "next_stop_name": str(bus["next_stop_name"]),
                "eta_next_stop_minutes": float(bus["eta_next_stop_minutes"]),
            }
            for bus in buses
        ]

    return buses


@router.get("/telemetry")
def get_telemetry(route_name: str | None = Query(default=None), compact: bool = Query(default=False)) -> dict[str, str | float | int | list[float]]:
    # Keep telemetry fresh even if clients only poll this endpoint.
    buses = current_buses_snapshot(time())
    update_telemetry_histories(buses)

    if route_name and route_name in TELEMETRY_HISTORY:
        key = route_name
        label = route_name
    else:
        key = "__all__"
        label = "All Routes"

    speed_series = TELEMETRY_HISTORY[key]["speed"]
    load_series = TELEMETRY_HISTORY[key]["load"]

    if compact:
        speed_series = speed_series[-8:]
        load_series = load_series[-8:]

    latest_speed = speed_series[-1] if speed_series else 0.0
    latest_load = load_series[-1] if load_series else 0.0

    return {
        "route_name": label,
        "speed_series": speed_series,
        "load_series": load_series,
        "latest_speed": latest_speed,
        "latest_load": latest_load,
        "sample_count": len(speed_series),
    }
