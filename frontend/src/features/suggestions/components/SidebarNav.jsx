const navItems = [
  "Dashboard",
  "Live Tracking",
  "Routes",
  "Crowd Alerts",
  "Analytics",
  "Reports",
  "Settings",
];

function SidebarNav() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sky-900/60 bg-sky-950 text-sky-100 lg:block">
      <div className="border-b border-sky-900/60 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Smart Mobility</p>
        <h2 className="mt-1 text-xl font-bold">Pune Bus Grid</h2>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item, index) => {
          const active = index === 1;
          return (
            <button
              key={item}
              type="button"
              className={`w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                active
                  ? "bg-sky-600/30 text-white"
                  : "text-sky-200 hover:bg-sky-900/60 hover:text-white"
              }`}
            >
              {item}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}

export default SidebarNav;
