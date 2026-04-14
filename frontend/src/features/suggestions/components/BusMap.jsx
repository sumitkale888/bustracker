import { useEffect, useMemo, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";

import { fetchBuses } from "../api/suggestionApi";

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
        setError("Unable to fetch bus locations right now.");
      }
    };

    loadBuses();
    const timer = setInterval(loadBuses, 3000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const mapCenter = useMemo(() => {
    if (!buses.length) {
      return [18.5204, 73.8567];
    }

    const lat = buses.reduce((sum, bus) => sum + bus.latitude, 0) / buses.length;
    const lng = buses.reduce((sum, bus) => sum + bus.longitude, 0) / buses.length;
    return [lat, lng];
  }, [buses]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold tracking-wide text-slate-700">Live Bus Map</p>
        <p className="text-xs text-slate-500">Synced from /buses every 3s</p>
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
