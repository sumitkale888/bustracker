function RouteSelector({ routes, selectedRoute, onChange, disabled }) {
  return (
    <div className="space-y-2">
      <label htmlFor="route" className="text-sm font-semibold tracking-wide text-slate-700">
        Select route
      </label>
      <select
        id="route"
        value={selectedRoute}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-4 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-100"
      >
        <option value="">Choose a route</option>
        {routes.map((route) => (
          <option key={route.id} value={route.id}>
            {route.name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default RouteSelector;
