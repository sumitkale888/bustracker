import { useEffect, useState } from "react";

import { fetchRoutes } from "../features/suggestions/api/suggestionApi";
import BusMap from "../features/suggestions/components/BusMap";
import MetricStrip from "../features/suggestions/components/MetricStrip";
import RouteSelector from "../features/suggestions/components/RouteSelector";

function LiveTrackingPage() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [visibleBusCount, setVisibleBusCount] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRoutes = async () => {
      try {
        const data = await fetchRoutes();
        if (!isMounted) {
          return;
        }
        setRoutes(data);
        setError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setRoutes([]);
        setError("Unable to load routes.");
      }
    };

    loadRoutes();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRouteName = routes.find((route) => route.id === selectedRoute)?.name || "";

  return (
    <div className="space-y-4">
      <MetricStrip selectedRouteName={selectedRouteName} busesCount={visibleBusCount} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <RouteSelector
          routes={routes}
          selectedRoute={selectedRoute}
          onChange={setSelectedRoute}
          disabled={false}
        />
        {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}
      </section>

      <BusMap selectedRouteName={selectedRouteName} onVisibleBusCountChange={setVisibleBusCount} />
    </div>
  );
}

export default LiveTrackingPage;
