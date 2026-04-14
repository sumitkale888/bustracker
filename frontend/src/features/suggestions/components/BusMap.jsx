import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import { fetchBuses } from "../api/suggestionApi";

const fallbackBuses = [
  { id: 1, route_name: "Route A", latitude: 12.9716, longitude: 77.5946 },
  { id: 2, route_name: "Route B", latitude: 12.9784, longitude: 77.6408 },
  { id: 3, route_name: "Route C", latitude: 12.9352, longitude: 77.6245 },
];

function jitterCoordinate(value) {
  const delta = (Math.random() - 0.5) * 0.002;
  return Number((value + delta).toFixed(6));
}

function BusMap({ selectedRouteName }) {
  const [buses, setBuses] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadBuses = async () => {
      try {
        const data = await fetchBuses();
        if (!isMounted) {
          return;
        }
        setBuses(data);
        setError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setBuses(fallbackBuses);
        setError("Could not fetch /buses. Showing fallback bus positions.");
      }
    };

    loadBuses();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!buses.length) {
      return;
    }

    const timer = setInterval(() => {
      setBuses((current) =>
        current.map((bus) => ({
          ...bus,
          latitude: jitterCoordinate(bus.latitude),
          longitude: jitterCoordinate(bus.longitude),
        })),
      );
    }, 2500);

    return () => clearInterval(timer);
  }, [buses.length]);

  const mapCenter = useMemo(() => {
    if (!buses.length) {
      return [12.9716, 77.5946];
    }

    const lat = buses.reduce((sum, bus) => sum + bus.latitude, 0) / buses.length;
    const lng = buses.reduce((sum, bus) => sum + bus.longitude, 0) / buses.length;
    return [lat, lng];
  }, [buses]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-wide text-slate-700">Live Bus Map</p>
        <p className="text-xs text-slate-500">Markers move every 2.5s</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
        <MapContainer center={mapCenter} zoom={12} scrollWheelZoom className="h-80 w-full">
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {buses.map((bus) => {
            const isSelected = selectedRouteName && bus.route_name === selectedRouteName;
            return (
              <CircleMarker
                key={bus.id}
                center={[bus.latitude, bus.longitude]}
                radius={isSelected ? 10 : 7}
                pathOptions={{
                  color: isSelected ? "#0f172a" : "#0e7490",
                  fillColor: isSelected ? "#0f172a" : "#22d3ee",
                  fillOpacity: 0.9,
                  weight: 2,
                }}
              >
                <Popup>
                  <div className="space-y-1 text-sm">
                    <p className="font-semibold">{bus.route_name}</p>
                    <p>Bus ID: {bus.id}</p>
                    <p>Lat: {bus.latitude}</p>
                    <p>Lng: {bus.longitude}</p>
                  </div>
                </Popup>
              </CircleMarker>
            );
          })}
        </MapContainer>
      </div>

      {error ? <p className="text-xs text-amber-700">{error}</p> : null}
    </div>
  );
}

export default BusMap;
