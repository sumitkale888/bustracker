import { useEffect, useState } from "react";

import { fetchTelemetry } from "../api/suggestionApi";
import { useAppSettings } from "../../../context/AppSettingsContext";

function sparklinePoints(series) {
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = Math.max(max - min, 1);

  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * 100;
      const y = 40 - ((value - min) / range) * 32;
      return `${x},${y}`;
    })
    .join(" ");
}

function KpiMiniCharts({ selectedRouteName, visibleBusCount }) {
  const { lowBandwidth } = useAppSettings();
  const [speedSeries, setSpeedSeries] = useState([]);
  const [loadSeries, setLoadSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadTelemetry = async () => {
      try {
        const data = await fetchTelemetry(selectedRouteName || undefined, { compact: lowBandwidth });
        if (!isMounted) {
          return;
        }
        setSpeedSeries(data.speed_series || []);
        setLoadSeries(data.load_series || []);
        setError("");
      } catch {
        if (!isMounted) {
          return;
        }
        setError("Telemetry unavailable");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const intervalMs = lowBandwidth ? 8000 : 3000;
    loadTelemetry();
    const timer = setInterval(loadTelemetry, intervalMs);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [selectedRouteName, lowBandwidth]);

  const speedChartSeries = speedSeries.length ? speedSeries : [0, 0];
  const loadChartSeries = loadSeries.length ? loadSeries : [0, 0];

  const cards = [
    {
      title: "Speed Trend",
      unit: "km/h",
      color: "text-cyan-700",
      stroke: "#0891b2",
      series: speedChartSeries,
    },
    {
      title: "Load Trend",
      unit: "%",
      color: "text-amber-700",
      stroke: "#d97706",
      series: loadChartSeries,
    },
  ];

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Live Telemetry</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">Buses tracked: {visibleBusCount}</p>
      </div>

      {isLoading ? <p className="px-1 text-xs text-slate-500 dark:text-slate-400">Loading telemetry...</p> : null}
      {error ? <p className="px-1 text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}

      <div className="grid gap-3 md:grid-cols-2">
      {cards.map((card) => {
        const latest = card.series[card.series.length - 1];
        return (
          <article key={card.title} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">{card.title}</p>
              <p className={`text-sm font-bold ${card.color}`}>{latest} {card.unit}</p>
            </div>

            <svg viewBox="0 0 100 44" className="h-16 w-full">
              <polyline
                fill="none"
                stroke={card.stroke}
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints(card.series)}
              />
            </svg>
          </article>
        );
      })}
      </div>
    </section>
  );
}

export default KpiMiniCharts;
