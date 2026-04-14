import { useEffect, useMemo, useState } from "react";

import { fetchDashboardSummary, fetchRouteStats, fetchRoutes, fetchSuggestion, sendCrowdReport } from "./api/suggestionApi";
import BusMap from "./components/BusMap";
import CrowdButtons from "./components/CrowdButtons";
import DashboardSummaryPanel from "./components/DashboardSummaryPanel";
import EventFeed from "./components/EventFeed";
import KpiMiniCharts from "./components/KpiMiniCharts";
import MetricStrip from "./components/MetricStrip";
import RouteSelector from "./components/RouteSelector";
import SidebarNav from "./components/SidebarNav";
import SuggestionResult from "./components/SuggestionResult";
import RouteStatsPanel from "./components/RouteStatsPanel";

function RouteSuggestionPanel() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedCrowd, setSelectedCrowd] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState("");
  const [visibleBusCount, setVisibleBusCount] = useState(0);
  const [theme, setTheme] = useState("light");
  const [routeStats, setRouteStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState("");
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRoutes = async () => {
      setIsLoadingRoutes(true);
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
        setError("Unable to load routes. Please check backend connection.");
      } finally {
        if (isMounted) {
          setIsLoadingRoutes(false);
        }
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
        setStatsError("Unable to load route statistics.");
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    loadStats();
    const timer = setInterval(loadStats, 6000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedRouteName]);

  useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      setIsLoadingSummary(true);
      try {
        const data = await fetchDashboardSummary();
        if (!isMounted) {
          return;
        }
        setDashboardSummary(data);
        setSummaryError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setDashboardSummary(null);
        setSummaryError("Unable to load dashboard summary.");
      } finally {
        if (isMounted) {
          setIsLoadingSummary(false);
        }
      }
    };

    loadSummary();
    const timer = setInterval(loadSummary, 6000);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  const handleCrowdSelect = async (level) => {
    setSelectedCrowd(level);

    if (!selectedRoute) {
      setSuggestion(null);
      setError("Select a route first.");
      return;
    }

    setError("");
    setIsSuggesting(true);

    try {
      const crowdData = await sendCrowdReport(selectedRouteName, level);
      const suggestionData = await fetchSuggestion(selectedRouteName);
      setSuggestion({
        action: suggestionData.action,
        crowd_level: suggestionData.effective_crowd_level || level,
        effective_crowd_level: suggestionData.effective_crowd_level || level,
        user_crowd_level: suggestionData.user_crowd_level === "not_available" ? undefined : suggestionData.user_crowd_level || level,
        time_based_crowd_level: suggestionData.time_based_crowd_level,
        time_slot: suggestionData.time_slot,
        high_demand_alert: suggestionData.high_demand_alert,
        alert_message: suggestionData.alert_message,
        routeName: selectedRouteName,
        crowdMessage: crowdData.message,
        totalReports: crowdData.total_reports,
      });
    } catch {
      setSuggestion(null);
      setError("Could not process crowd update or suggestion request. Please try again.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <main className={`${theme === "dark" ? "dark" : ""} min-h-screen bg-slate-100 dark:bg-slate-950`}>
      <div className="flex min-h-screen">
        <SidebarNav />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Realtime Dashboard</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">Smart Bus Tracking</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTheme((prev) => (prev === "dark" ? "light" : "dark"))}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                >
                  {theme === "dark" ? "Light Mode" : "Dark Mode"}
                </button>
                <div className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white dark:bg-sky-700">Pune Operations</div>
              </div>
            </div>
          </header>

          <div className="space-y-4 px-4 py-4 md:px-6 md:py-6">
            <MetricStrip selectedRouteName={selectedRouteName} busesCount={visibleBusCount} />
            <KpiMiniCharts selectedRouteName={selectedRouteName} visibleBusCount={visibleBusCount} />
            <DashboardSummaryPanel summary={dashboardSummary} isLoading={isLoadingSummary} error={summaryError} />
            <RouteStatsPanel stats={routeStats} isLoading={isLoadingStats} error={statsError} />

            <div className="grid gap-4 xl:grid-cols-[2fr_1fr]">
              <BusMap
                selectedRouteName={selectedRouteName}
                onVisibleBusCountChange={setVisibleBusCount}
                crowdLevel={suggestion?.effective_crowd_level || suggestion?.crowd_level}
              />
              <EventFeed selectedRouteName={selectedRouteName} suggestion={suggestion} />
            </div>

            <section className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 lg:grid-cols-2">
              <div className="space-y-4">
                <RouteSelector
                  routes={routes}
                  selectedRoute={selectedRoute}
                  onChange={(value) => {
                    setSelectedRoute(value);
                    setSuggestion(null);
                    setError("");
                  }}
                  disabled={isLoadingRoutes}
                />

                {isLoadingRoutes ? <p className="text-sm text-slate-500">Loading routes...</p> : null}
                {!isLoadingRoutes && !error && routes.length === 0 ? <p className="text-sm text-slate-500">No routes available.</p> : null}

                <CrowdButtons selectedLevel={selectedCrowd} onSelect={handleCrowdSelect} disabled={isLoadingRoutes || isSuggesting} />
              </div>

              <SuggestionResult suggestion={suggestion} isLoading={isSuggesting} error={error} />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

export default RouteSuggestionPanel;
