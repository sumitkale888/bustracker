import { useEffect, useMemo, useState } from "react";

import { fetchRoutes, fetchSuggestion, sendCrowdReport } from "./api/suggestionApi";
import BusMap from "./components/BusMap";
import CrowdButtons from "./components/CrowdButtons";
import RouteSelector from "./components/RouteSelector";
import SuggestionResult from "./components/SuggestionResult";

function RouteSuggestionPanel() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState("");
  const [selectedCrowd, setSelectedCrowd] = useState("");
  const [suggestion, setSuggestion] = useState(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadRoutes = async () => {
      setIsLoadingRoutes(true);
      const data = await fetchRoutes();
      if (!isMounted) {
        return;
      }
      setRoutes(data);
      setIsLoadingRoutes(false);
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

  const fallbackByCrowd = {
    low: "Reduce bus",
    medium: "No change",
    high: "Add bus",
  };

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
      const suggestionData = await fetchSuggestion(level);
      setSuggestion({
        ...suggestionData,
        routeName: selectedRouteName,
        crowdMessage: crowdData.message,
        totalReports: crowdData.total_reports,
      });
    } catch {
      setSuggestion({
        crowd_level: level,
        effective_crowd_level: level,
        user_crowd_level: level,
        suggestion: fallbackByCrowd[level],
        routeName: selectedRouteName,
      });
      setError("Could not connect to /crowd and /suggest. Showing fallback suggestion.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <section className="mx-auto w-full max-w-5xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">Smart Bus Dashboard</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">Route Crowd Suggestion</h1>
          <p className="mt-2 text-slate-600">Choose a route and crowd level to get a clear bus action recommendation.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-6">
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

          <CrowdButtons selectedLevel={selectedCrowd} onSelect={handleCrowdSelect} disabled={isLoadingRoutes || isSuggesting} />

          <SuggestionResult suggestion={suggestion} isLoading={isSuggesting} error={error} />
          </div>

          <BusMap selectedRouteName={selectedRouteName} />
        </div>
      </section>
    </main>
  );
}

export default RouteSuggestionPanel;
