import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

const fallbackRoutes = [
  { id: "1", name: "Route A" },
  { id: "2", name: "Route B" },
  { id: "3", name: "Route C" },
];

export async function fetchRoutes() {
  try {
    const { data } = await api.get("/buses");
    return data.map((bus) => ({
      id: String(bus.id),
      name: bus.route_name,
    }));
  } catch {
    return fallbackRoutes;
  }
}

export async function fetchBuses() {
  const { data } = await api.get("/buses");
  return data;
}

export async function sendCrowdReport(routeName, crowdLevel) {
  const { data } = await api.post("/crowd", {
    route_name: routeName,
    crowd_level: crowdLevel,
  });
  return data;
}

export async function fetchSuggestion(crowdLevel) {
  const { data } = await api.post("/suggest", { crowd_level: crowdLevel });
  return data;
}
