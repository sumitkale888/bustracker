import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

export async function fetchRoutes() {
  const { data } = await api.get("/buses");
  const uniqueRouteNames = [...new Set(data.map((bus) => bus.route_name))];
  return uniqueRouteNames.map((routeName) => ({ id: routeName, name: routeName }));
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

export async function fetchSuggestion(routeName) {
  const { data } = await api.get("/suggest", { params: { route_name: routeName } });
  return data;
}
