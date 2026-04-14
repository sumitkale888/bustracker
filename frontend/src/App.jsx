
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AppSettingsProvider } from "./context/AppSettingsContext";
import AppLayout from "./layouts/AppLayout";
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import CrowdManagementPage from "./pages/CrowdManagementPage";
import DashboardPage from "./pages/DashboardPage";
import LiveTrackingPage from "./pages/LiveTrackingPage";

function App() {
  return (
    <AppSettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="live-tracking" element={<LiveTrackingPage />} />
            <Route path="crowd-management" element={<CrowdManagementPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="alerts" element={<AlertsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppSettingsProvider>
  );
}

export default App;
