import { useEffect, useMemo, useState } from "react";

import { fetchRouteStats, fetchRoutes } from "../features/suggestions/api/suggestionApi";
import KpiMiniCharts from "../features/suggestions/components/KpiMiniCharts";
import RouteSelector from "../features/suggestions/components/RouteSelector";
import RouteStatsPanel from "../features/suggestions/components/RouteStatsPanel";
import { useAppSettings } from "../context/AppSettingsContext";

function AnalyticsPage() {
  const { lowBandwidth } = useAppSettings();
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [routeStats, setRouteStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRoutes = async () => {
      try {
        const data = await fetchRoutes();
        if (!isMounted) {
          return;
        }
        setRoutes(data);
      } catch {
        if (!isMounted) {
          return;
        }
        setRoutes([]);
      }
    };

    loadRoutes();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedRouteName = useMemo(() => {
    const route = routes.find((item) => item.id === selectedRoute);
    return route?.name || "";
  }, [routes, selectedRoute]);

  useEffect(() => {
    let isMounted = true;

    if (!selectedRouteName) {
      setRouteStats(null);
      setStatsError("");
      return () => {
        isMounted = false;
      };
    }

    const loadStats = async () => {
      setIsLoadingStats(true);
      try {
        const data = await fetchRouteStats(selectedRouteName);
        if (!isMounted) {
          return;
        }
        setRouteStats(data);
        setStatsError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setRouteStats(null);
        setStatsError("Unable to load route analytics.");
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    const intervalMs = lowBandwidth ? 12000 : 6000;
    loadStats();
    const timer = setInterval(loadStats, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedRouteName, lowBandwidth]);

  return (
    <div className="space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <RouteSelector
          routes={routes}
          selectedRoute={selectedRoute}
          onChange={setSelectedRoute}
          disabled={false}
        />
      </section>

      <KpiMiniCharts selectedRouteName={selectedRouteName} visibleBusCount={0} />
      <RouteStatsPanel stats={routeStats} isLoading={isLoadingStats} error={statsError} />
    </div>
  );
}

export default AnalyticsPage;
