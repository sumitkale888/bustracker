import { useEffect, useState } from "react";

import { fetchFleetDemand, rebalanceFleet } from "../features/suggestions/api/suggestionApi";
import { useAppSettings } from "../context/AppSettingsContext";

function AlertsPage() {
  const { lowBandwidth } = useAppSettings();
  const [routes, setRoutes] = useState([]);
  const [moves, setMoves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRebalancing, setIsRebalancing] = useState(false);
  const [error, setError] = useState("");

  const loadDemand = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFleetDemand();
      setRoutes(data.routes || []);
      setError("");
    } catch {
      setRoutes([]);
      setError("Unable to load alerts.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDemand();
    const timer = setInterval(loadDemand, lowBandwidth ? 12000 : 6000);
    return () => clearInterval(timer);
  }, [lowBandwidth]);

  const handleRebalance = async () => {
    setIsRebalancing(true);
    try {
      const data = await rebalanceFleet();
      setMoves(data.moves || []);
      setRoutes(data.snapshot || []);
      setError("");
    } catch {
      setError("Rebalance failed.");
    } finally {
      setIsRebalancing(false);
    }
  };

  const alerts = routes.filter((item) => item.shortage > 0 || item.effective_crowd_level === "high");

  return (
    <div className="space-y-4">
      <section className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">High Crowd Alerts</h3>
          <p className="text-xs text-slate-500">Monitor route shortages and trigger dynamic reassignment.</p>
        </div>
        <button
          type="button"
          onClick={handleRebalance}
          disabled={isRebalancing}
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isRebalancing ? "Rebalancing..." : "Run Rebalance"}
        </button>
      </section>

      {isLoading ? <p className="text-sm text-slate-500">Loading alerts...</p> : null}
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}

      <section className="space-y-2">
        {alerts.length === 0 ? (
          <p className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">No high demand alerts at the moment.</p>
        ) : (
          alerts.map((alert) => (
            <article key={alert.route_name} className="rounded-lg border border-rose-200 bg-rose-50 p-4">
              <p className="text-sm font-semibold text-rose-800">{alert.route_name}</p>
              <p className="text-xs text-rose-700">
                High demand detected, additional buses required. Active: {alert.active_buses}, Recommended: {alert.recommended_buses}
              </p>
            </article>
          ))
        )}
      </section>

      {moves.length > 0 ? (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-800">System Messages</h3>
          <div className="mt-2 space-y-2">
            {moves.map((move) => (
              <p key={`${move.bus_id}-${move.from_route}-${move.to_route}`} className="text-xs text-slate-600">
                Bus {move.bus_id} reassigned from {move.from_route} to {move.to_route}
              </p>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default AlertsPage;
