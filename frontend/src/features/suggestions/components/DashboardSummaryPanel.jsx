function CrowdBadge({ label, value, className }) {
  return (
    <div className={`rounded-lg px-3 py-2 ${className}`}>
      <p className="text-xs uppercase tracking-wide">{label}</p>
      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function DashboardSummaryPanel({ summary, isLoading, error }) {
  if (isLoading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading dashboard summary...</p>
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

  if (!summary) {
    return null;
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">System Overview</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Live operational summary</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Total Buses</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.total_buses}</p>
        </article>
        <article className="rounded-lg bg-slate-50 p-3 dark:bg-slate-800">
          <p className="text-xs text-slate-500 dark:text-slate-400">Active Routes</p>
          <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-100">{summary.active_routes}</p>
        </article>
      </div>

      <div className="grid gap-2 sm:grid-cols-3">
        <CrowdBadge label="High" value={summary.crowd_levels.high} className="bg-rose-100 text-rose-700" />
        <CrowdBadge label="Medium" value={summary.crowd_levels.medium} className="bg-amber-100 text-amber-700" />
        <CrowdBadge label="Low" value={summary.crowd_levels.low} className="bg-emerald-100 text-emerald-700" />
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">System Recommendations</p>
        <div className="space-y-2">
          {summary.recommendations.map((item) => (
            <div key={item.route_name} className="rounded-lg border border-slate-200 p-3 dark:border-slate-700">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{item.route_name}</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Action: {item.action} | Active: {item.active_buses} | Target: {item.recommended_buses}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DashboardSummaryPanel;
