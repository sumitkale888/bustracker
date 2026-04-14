const CACHE_PREFIX = "smartbus-cache";

function serializeParams(params) {
  if (!params) {
    return "";
  }

  const entries = Object.entries(params)
    .filter(([, value]) => typeof value !== "undefined" && value !== null)
    .sort(([a], [b]) => a.localeCompare(b));

  return entries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join("&");
}

function buildKey(endpoint, params) {
  const query = serializeParams(params);
  return `${CACHE_PREFIX}:${endpoint}${query ? `?${query}` : ""}`;
}

function readCache(endpoint, params) {
  try {
    const raw = window.localStorage.getItem(buildKey(endpoint, params));
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return parsed.data;
  } catch {
    return null;
  }
}

function writeCache(endpoint, params, data) {
  try {
    const payload = {
      timestamp: Date.now(),
      data,
    };
    window.localStorage.setItem(buildKey(endpoint, params), JSON.stringify(payload));
  } catch {
    // Cache writes should never block UI/API behavior.
  }
}

export async function getWithOfflineCache({ endpoint, params, request }) {
  try {
    const response = await request();
    writeCache(endpoint, params, response);
    return response;
  } catch (error) {
    const cached = readCache(endpoint, params);
    if (cached !== null) {
      return cached;
    }
    throw error;
  }
}
