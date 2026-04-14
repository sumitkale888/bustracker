import { useEffect, useMemo, useRef, useState } from "react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer } from "react-leaflet";

import { fetchBuses, fetchRoutePaths } from "../api/suggestionApi";
import { useAppSettings } from "../../../context/AppSettingsContext";

function getBusStatus(bus, selectedRouteName, crowdLevel) {
  if ((crowdLevel === "high" || crowdLevel === "medium") && selectedRouteName && bus.route_name === selectedRouteName) {
    return "Crowded";
  }
  if (bus.id % 3 === 0) {
    return "Delayed";
  }
  return "On time";
}

function statusStyles(status) {
  if (status === "Crowded") {
    return {
      chip: "bg-rose-100 text-rose-700",
      markerColor: "#be123c",
      markerFill: "#fb7185",
    };
  }
  if (status === "Delayed") {
    return {
      chip: "bg-amber-100 text-amber-700",
      markerColor: "#b45309",
      markerFill: "#f59e0b",
    };
  }
  return {
    chip: "bg-emerald-100 text-emerald-700",
    markerColor: "#047857",
    markerFill: "#34d399",
  };
}

function BusMap({ selectedRouteName, onVisibleBusCountChange, crowdLevel }) {
  const { lowBandwidth } = useAppSettings();
  const [buses, setBuses] = useState([]);
  const [routePaths, setRoutePaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const busesRef = useRef([]);
  const animationTimerRef = useRef(null);

  const animateToNextPositions = (fromBuses, toBuses) => {
    if (animationTimerRef.current) {
      clearInterval(animationTimerRef.current);
      animationTimerRef.current = null;
    }

    if (!fromBuses.length) {
      setBuses(toBuses);
      return;
    }

    const previousById = new Map(fromBuses.map((bus) => [bus.id, bus]));
    const startTime = Date.now();
    const durationMs = lowBandwidth ? 1600 : 2800;

    animationTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / durationMs, 1);

      const interpolated = toBuses.map((target) => {
        const source = previousById.get(target.id);
        if (!source) {
          return target;
        }
        return {
          ...target,
          latitude: source.latitude + (target.latitude - source.latitude) * progress,
          longitude: source.longitude + (target.longitude - source.longitude) * progress,
        };
      });

      setBuses(interpolated);
      if (progress >= 1) {
        clearInterval(animationTimerRef.current);
        animationTimerRef.current = null;
      }
    }, 100);
  };

  useEffect(() => {
    busesRef.current = buses;
  }, [buses]);

  useEffect(() => {
    let isMounted = true;

    const loadBuses = async () => {
      try {
        const [busData, routeData] = await Promise.all([
          fetchBuses({ compact: lowBandwidth }),
          fetchRoutePaths({ compact: lowBandwidth }),
        ]);
        if (!isMounted) {
          return;
        }
        animateToNextPositions(busesRef.current, busData);
        setRoutePaths(routeData);
        setError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setError("Unable to fetch bus locations right now.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const intervalMs = lowBandwidth ? 8000 : 3000;
    loadBuses();
    const timer = setInterval(loadBuses, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
      if (animationTimerRef.current) {
        clearInterval(animationTimerRef.current);
      }
    };
  }, [lowBandwidth]);

  const mapCenter = useMemo(() => {
    const filtered = selectedRouteName ? buses.filter((bus) => bus.route_name === selectedRouteName) : buses;

    if (!filtered.length) {
      return [18.5204, 73.8567];
    }

    const lat = filtered.reduce((sum, bus) => sum + bus.latitude, 0) / filtered.length;
    const lng = filtered.reduce((sum, bus) => sum + bus.longitude, 0) / filtered.length;
    return [lat, lng];
  }, [buses, selectedRouteName]);

  const visibleBuses = useMemo(() => {
    if (!selectedRouteName) {
      return buses;
    }
    return buses.filter((bus) => bus.route_name === selectedRouteName);
  }, [buses, selectedRouteName]);

  useEffect(() => {
    if (onVisibleBusCountChange) {
      onVisibleBusCountChange(visibleBuses.length);
    }
  }, [visibleBuses.length, onVisibleBusCountChange]);

  const visiblePaths = useMemo(() => {
    if (!selectedRouteName) {
      return routePaths;
    }
    return routePaths.filter((route) => route.route_name === selectedRouteName);
  }, [routePaths, selectedRouteName]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">Live Bus Map</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Smooth updates from /buses every 3s</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm dark:border-slate-700">
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-80 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {visiblePaths.map((route) => (
            <Polyline
              key={route.route_name}
              positions={route.path.map((point) => [point.latitude, point.longitude])}
              pathOptions={{ color: "#0ea5e9", weight: 4, opacity: 0.6 }}
            />
          ))}

          {visibleBuses.map((bus) => {
            const isSelected = selectedRouteName && bus.route_name === selectedRouteName;
            const status = getBusStatus(bus, selectedRouteName, crowdLevel);
            const styles = statusStyles(status);
            return (
              <CircleMarker
                key={bus.id}
                center={[bus.latitude, bus.longitude]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  color: isSelected ? "#0f172a" : styles.markerColor,
                  fillColor: isSelected ? "#0f172a" : styles.markerFill,
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{bus.route_name}</p>
                    <p>Bus ID: {bus.id}</p>
                    <p>
                      Status: <span className={`rounded-full px-2 py-1 text-xs font-semibold ${styles.chip}`}>{status}</span>
                    </p>
                    <p>Lat: {bus.latitude}</p>
                    <p>Lng: {bus.longitude}</p>
                    {bus.current_stop_name ? <p>Current stop: {bus.current_stop_name}</p> : null}
                    <p>Next stop: {bus.next_stop_name || "N/A"}</p>
                    {typeof bus.remaining_distance_km !== "undefined" ? <p>Distance to next stop: {bus.remaining_distance_km} km</p> : null}
                    <p>
                      ETA: {typeof bus.eta_next_stop_minutes !== "undefined" ? `${bus.eta_next_stop_minutes} min` : "N/A"}
                      {typeof bus.eta_next_stop_seconds !== "undefined" ? ` (${bus.eta_next_stop_seconds}s)` : ""}
                    </p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {isLoading ? <p className="text-xs text-slate-500 dark:text-slate-400">Loading bus locations...</p> : null}
      {!isLoading && !error && visibleBuses.length === 0 ? <p className="text-xs text-slate-500 dark:text-slate-400">No buses available for selected route.</p> : null}

      {error ? <p className="text-xs text-amber-700 dark:text-amber-400">{error}</p> : null}
    </div>
  );
}

export default BusMap;
