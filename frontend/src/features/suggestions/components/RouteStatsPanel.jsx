function badgeClass(level) {
  if (level === "high") {
    return "bg-rose-100 text-rose-700";
  }
  if (level === "medium") {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-emerald-100 text-emerald-700";
}

function RouteStatsPanel({ stats, isLoading, error }) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading route statistics...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="rounded-xl border border-rose-200 bg-rose-50 p-4 shadow-sm dark:border-rose-900 dark:bg-rose-950/40">
        <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p>
      </section>
    );
  }

  if (!stats) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Select a route to view analytics.</p>
      </section>
    );
  }

  return (
    <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Route Statistics</h3>
        <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase ${badgeClass(stats.average_crowd_level)}`}>
          Avg crowd: {stats.average_crowd_level}
        </span>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <article className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Active buses</p>
          <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">{stats.active_buses}</p>
        </article>
        <article className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total reports</p>
          <p className="mt-1 text-xl font-bold text-slate-800 dark:text-slate-100">{stats.total_reports}</p>
        </article>
        <article className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Peak trend</p>
          <p className="mt-1 text-xl font-bold capitalize text-slate-800 dark:text-slate-100">{stats.peak_time_slot}</p>
        </article>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Peak Time Trends</p>
        <div className="space-y-2">
          {stats.peak_trends.map((item) => (
            <div key={item.slot}>
              <div className="mb-1 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
                <span className="capitalize">{item.slot.replace("_", " ")}</span>
                <span>{item.reports} reports</span>
              </div>
              <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-2 rounded-full bg-cyan-500"
                  style={{ width: `${stats.total_reports ? (item.reports / stats.total_reports) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default RouteStatsPanel;
