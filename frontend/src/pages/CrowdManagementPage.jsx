import { useEffect, useMemo, useState } from "react";

import { fetchRoutes, fetchSuggestion, sendCrowdReport } from "../features/suggestions/api/suggestionApi";
import CrowdButtons from "../features/suggestions/components/CrowdButtons";
import RouteSelector from "../features/suggestions/components/RouteSelector";
import SuggestionResult from "../features/suggestions/components/SuggestionResult";

function CrowdManagementPage() {
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

  const handleCrowdSelect = async (level) => {
    setSelectedCrowd(level);

    if (!selectedRouteName) {
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
      setError("Could not process crowd request.");
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
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

        <CrowdButtons
          selectedLevel={selectedCrowd}
          onSelect={handleCrowdSelect}
          disabled={isLoadingRoutes || isSuggesting}
        />

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      </section>

      <SuggestionResult suggestion={suggestion} isLoading={isSuggesting} error={error} />
    </div>
  );
}

export default CrowdManagementPage;
