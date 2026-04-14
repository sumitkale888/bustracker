import { Outlet } from "react-router-dom";

import SidebarNavigation from "../components/SidebarNavigation";
import { useAppSettings } from "../context/AppSettingsContext";

function AppLayout() {
  const { lowBandwidth, setLowBandwidthMode } = useAppSettings();

  return (
    <main className="min-h-screen bg-slate-100">
      <div className="flex min-h-screen">
        <SidebarNavigation />

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-slate-200 bg-white px-4 py-4 shadow-sm md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-700">Realtime Control Center</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-900">Public Transport Management</h1>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setLowBandwidthMode(!lowBandwidth)}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
                >
                  {lowBandwidth ? "Low Bandwidth: ON" : "Low Bandwidth: OFF"}
                </button>
                <div className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Pune Operations</div>
              </div>
            </div>
          </header>

          <div className="px-4 py-4 md:px-6 md:py-6">
            <Outlet />
          </div>
        </section>
      </div>
    </main>
  );
}

export default AppLayout;
