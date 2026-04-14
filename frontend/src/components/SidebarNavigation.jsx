import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Dashboard" },
  { to: "/live-tracking", label: "Live Tracking" },
  { to: "/crowd-management", label: "Crowd Management" },
  { to: "/analytics", label: "Analytics" },
  { to: "/alerts", label: "Alerts" },
];

function SidebarNavigation() {
  return (
    <aside className="hidden w-64 shrink-0 border-r border-sky-900/50 bg-sky-950 text-sky-100 lg:block">
      <div className="border-b border-sky-900/50 px-6 py-5">
        <p className="text-xs uppercase tracking-[0.25em] text-sky-300">Transport Ops</p>
        <h2 className="mt-1 text-xl font-bold">Smart Bus System</h2>
      </div>

      <nav className="space-y-1 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `block rounded-lg px-3 py-2 text-sm font-medium transition ${
                isActive
                  ? "bg-sky-600/30 text-white"
                  : "text-sky-200 hover:bg-sky-900/60 hover:text-white"
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default SidebarNavigation;
