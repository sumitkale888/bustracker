function EventFeed({ selectedRouteName, suggestion }) {
  const items = [
    {
      time: "Just now",
      bus: selectedRouteName || "Any Route",
      severity: suggestion?.action === "Add bus" ? "HIGH" : "INFO",
      message:
        suggestion?.action === "Add bus"
          ? "High demand detected on this route"
          : "System running normally",
    },
    {
      time: "2 min ago",
      bus: "Route A",
      severity: "INFO",
      message: "Bus reached next stop",
    },
    {
      time: "5 min ago",
      bus: "Route B",
      severity: "INFO",
      message: "Live location synced",
    },
  ];

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <header className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">Bus Tracking Events</h3>
      </header>

      <div className="max-h-[22rem] overflow-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th className="px-4 py-2">Time</th>
              <th className="px-4 py-2">Route</th>
              <th className="px-4 py-2">Severity</th>
              <th className="px-4 py-2">Message</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={`${item.time}-${item.message}`} className="border-t border-slate-100 dark:border-slate-800">
                <td className="px-4 py-2 text-slate-600 dark:text-slate-300">{item.time}</td>
                <td className="px-4 py-2 font-medium text-slate-700 dark:text-slate-200">{item.bus}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${
                      item.severity === "HIGH"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-emerald-100 text-emerald-700"
                    }`}
                  >
                    {item.severity}
                  </span>
                </td>
                <td className="px-4 py-2 text-slate-700 dark:text-slate-300">{item.message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default EventFeed;
