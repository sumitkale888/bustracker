function crowdLevelStyle(level) {
  if (level === "high") {
    return "bg-rose-100 text-rose-700";
  }
  if (level === "medium") {
    return "bg-amber-100 text-amber-700";
  }
  return "bg-emerald-100 text-emerald-700";
}

function SuggestionResult({ suggestion, isLoading, error }) {
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-600 shadow-sm">
        Generating suggestion...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-rose-700 shadow-sm">
        {error}
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-5 text-slate-500 shadow-sm">
        Choose a route and crowd level to view the suggestion.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-widest text-slate-500">Suggestion Result</p>
      <h3 className="mt-3 rounded-lg border border-cyan-200 bg-cyan-50 px-4 py-3 text-2xl font-bold text-slate-900">
        {suggestion.suggestion}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${crowdLevelStyle(suggestion.effective_crowd_level || suggestion.crowd_level)}`}>
          Effective: {(suggestion.effective_crowd_level || suggestion.crowd_level || "low").replace("_", " ")}
        </span>
        {suggestion.user_crowd_level ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${crowdLevelStyle(suggestion.user_crowd_level)}`}>
            User: {suggestion.user_crowd_level}
          </span>
        ) : null}
        {suggestion.time_based_crowd_level ? (
          <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${crowdLevelStyle(suggestion.time_based_crowd_level)}`}>
            Time: {suggestion.time_based_crowd_level}
          </span>
        ) : null}
      </div>

      <p className="mt-4 text-slate-700">
        Route: <span className="font-semibold">{suggestion.routeName}</span>
      </p>
      {suggestion.time_slot ? (
        <p className="mt-1 text-slate-700">
          Time slot: <span className="font-semibold capitalize">{suggestion.time_slot.replace("_", " ")}</span>
        </p>
      ) : null}
      {suggestion.crowdMessage ? <p className="mt-2 text-sm text-slate-600">{suggestion.crowdMessage}</p> : null}
      {typeof suggestion.totalReports === "number" ? (
        <p className="mt-1 text-sm text-slate-600">Total crowd reports: {suggestion.totalReports}</p>
      ) : null}
    </div>
  );
}

export default SuggestionResult;
