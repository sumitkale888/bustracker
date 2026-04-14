import axios from "axios";

import { getWithOfflineCache } from "./offlineCache";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export async function fetchRoutes() {
  const data = await getWithOfflineCache({
    endpoint: "/routes",
    request: async () => {
      const response = await api.get("/routes");
      return response.data;
    },
  });
  return data.map((route) => ({ id: route.route_name, name: route.route_name }));
}

export async function fetchBuses(options = {}) {
  const params = options.compact ? { compact: true } : undefined;
  const data = await getWithOfflineCache({
    endpoint: "/buses",
    params,
    request: async () => {
      const response = await api.get("/buses", { params });
      return response.data;
    },
  });
  return data;
}

export async function fetchRoutePaths(options = {}) {
  const params = options.compact ? { compact: true } : undefined;
  const data = await getWithOfflineCache({
    endpoint: "/routes",
    params,
    request: async () => {
      const response = await api.get("/routes", { params });
      return response.data;
    },
  });
  return data;
}

export async function sendCrowdReport(routeName, crowdLevel) {
  const { data } = await api.post("/crowd", {
    route_name: routeName,
    crowd_level: crowdLevel,
  });
  return data;
}

export async function fetchSuggestion(routeName) {
  const { data } = await api.get("/suggest", { params: { route_name: routeName } });
  return data;
}

export async function fetchTelemetry(routeName, options = {}) {
  const params = {
    ...(routeName ? { route_name: routeName } : {}),
    ...(options.compact ? { compact: true } : {}),
  };
  const data = await getWithOfflineCache({
    endpoint: "/telemetry",
    params,
    request: async () => {
      const response = await api.get("/telemetry", { params });
      return response.data;
    },
  });
  return data;
}

export async function fetchRouteStats(routeName) {
  const params = { route_name: routeName };
  const data = await getWithOfflineCache({
    endpoint: "/route-stats",
    params,
    request: async () => {
      const response = await api.get("/route-stats", { params });
      return response.data;
    },
  });
  return data;
}

export async function fetchDashboardSummary() {
  const data = await getWithOfflineCache({
    endpoint: "/dashboard-summary",
    request: async () => {
      const response = await api.get("/dashboard-summary");
      return response.data;
    },
  });
  return data;
}

export async function fetchFleetDemand() {
  const data = await getWithOfflineCache({
    endpoint: "/fleet-demand",
    request: async () => {
      const response = await api.get("/fleet-demand");
      return response.data;
    },
  });
  return data;
}

export async function rebalanceFleet() {
  const { data } = await api.post("/fleet/rebalance");
  return data;
}

export async function fetchRouteAlert(routeName) {
  const params = { route_name: routeName };
  const data = await getWithOfflineCache({
    endpoint: "/alerts",
    params,
    request: async () => {
      const response = await api.get("/alerts", { params });
      return response.data;
    },
  });
  return data;
}
