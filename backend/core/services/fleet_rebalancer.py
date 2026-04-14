from ..routes.buses import list_active_bus_ids, list_route_names, reassign_bus
from .route_insights import suggest_for_route


def route_demand_snapshot() -> list[dict[str, str | int]]:
    snapshot: list[dict[str, str | int]] = []
    for route_name in list_route_names():
        suggestion = suggest_for_route(route_name)
        snapshot.append(
            {
                "route_name": route_name,
                "active_buses": int(suggestion["active_buses"]),
                "recommended_buses": int(suggestion["recommended_buses"]),
                "shortage": int(suggestion["shortage"]),
                "surplus": int(suggestion["surplus"]),
                "effective_crowd_level": str(suggestion["effective_crowd_level"]),
            }
        )
    return snapshot


def rebalance_buses() -> dict[str, list[dict[str, str | int]]]:
    snapshot = route_demand_snapshot()
    receivers = [item for item in snapshot if int(item["shortage"]) > 0]
    donors = [item for item in snapshot if int(item["surplus"]) > 0]

    moves: list[dict[str, str | int]] = []
    for receiver in receivers:
        needed = int(receiver["shortage"])
        if needed <= 0:
            continue

        for donor in donors:
            available = int(donor["surplus"])
            if available <= 0 or needed <= 0:
                continue

            donor_route = str(donor["route_name"])
            receiver_route = str(receiver["route_name"])
            donor_bus_ids = list_active_bus_ids(donor_route)
            if not donor_bus_ids:
                continue

            bus_id = donor_bus_ids[-1]
            if reassign_bus(bus_id, receiver_route):
                donor["surplus"] = available - 1
                needed -= 1
                receiver["shortage"] = needed
                moves.append(
                    {
                        "bus_id": bus_id,
                        "from_route": donor_route,
                        "to_route": receiver_route,
                    }
                )

    return {
        "moves": moves,
        "snapshot": route_demand_snapshot(),
    }
