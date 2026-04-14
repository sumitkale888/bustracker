function MetricStrip({ selectedRouteName, busesCount }) {
  const cards = [
    { label: "Active Buses", value: busesCount || 0, tone: "bg-cyan-50 text-cyan-700" },
    { label: "Tracked Route", value: selectedRouteName || "All Routes", tone: "bg-indigo-50 text-indigo-700" },
    { label: "Update Interval", value: "3s", tone: "bg-emerald-50 text-emerald-700" },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <article key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{card.label}</p>
          <p className={`mt-2 inline-flex rounded-lg px-3 py-1 text-lg font-bold ${card.tone}`}>{card.value}</p>
        </article>
      ))}
    </div>
  );
}

export default MetricStrip;
