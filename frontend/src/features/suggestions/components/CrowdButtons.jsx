const levels = [
  {
    key: "low",
    label: "Low",
    classes: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
    dot: "bg-emerald-500",
  },
  {
    key: "medium",
    label: "Medium",
    classes: "bg-amber-50 text-amber-700 hover:bg-amber-100",
    dot: "bg-amber-500",
  },
  {
    key: "high",
    label: "High",
    classes: "bg-rose-50 text-rose-700 hover:bg-rose-100",
    dot: "bg-rose-500",
  },
];

function CrowdButtons({ selectedLevel, onSelect, disabled }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold tracking-wide text-slate-700">Crowd level</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {levels.map((level) => {
          const isActive = selectedLevel === level.key;
          return (
            <button
              key={level.key}
              type="button"
              onClick={() => onSelect(level.key)}
              disabled={disabled}
              className={`rounded-xl px-4 py-3 font-semibold transition focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60 ${
                isActive ? "bg-slate-900 text-white" : level.classes
              }`}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-white" : level.dot}`} aria-hidden="true" />
                <span>{level.label}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default CrowdButtons;
