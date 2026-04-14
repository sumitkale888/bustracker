import { useEffect, useState } from "react";

import { fetchDashboardSummary, fetchFleetDemand } from "../features/suggestions/api/suggestionApi";
import DashboardSummaryPanel from "../features/suggestions/components/DashboardSummaryPanel";
import { useAppSettings } from "../context/AppSettingsContext";

function DashboardPage() {
  const { lowBandwidth } = useAppSettings();
  const [summary, setSummary] = useState(null);
  const [demand, setDemand] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const [summaryData, demandData] = await Promise.all([fetchDashboardSummary(), fetchFleetDemand()]);
        if (!isMounted) {
          return;
        }
        setSummary(summaryData);
        setDemand(demandData.routes || []);
        setError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setError("Unable to load dashboard data.");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const intervalMs = lowBandwidth ? 12000 : 6000;
    loadData();
    const timer = setInterval(loadData, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [lowBandwidth]);

  const alerts = demand.filter((item) => item.shortage > 0 || item.effective_crowd_level === "high");

  return (
    <div className="space-y-4">
      <DashboardSummaryPanel summary={summary} isLoading={isLoading} error={error} />

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-slate-800">System Alerts</h3>
        {alerts.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No critical alerts right now.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {alerts.map((item) => (
              <article key={item.route_name} className="rounded-lg border border-rose-200 bg-rose-50 p-3">
                <p className="text-sm font-semibold text-rose-800">{item.route_name}</p>
                <p className="text-xs text-rose-700">
                  High demand detected, additional buses required. Current: {item.active_buses}, Recommended: {item.recommended_buses}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default DashboardPage;
