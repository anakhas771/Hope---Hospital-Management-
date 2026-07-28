// src/lib/api.js
import { getValidToken } from "../utils/getToken";

export const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");

// ------------------------------
// IN-MEMORY CACHE & REQUEST DEDUPLICATION
// ------------------------------
const apiCache = new Map();
const pendingRequests = new Map();
const CACHE_TTL_MS = 30000; // 30 seconds cache for GET requests

export function clearApiCache() {
  apiCache.clear();
}

// Parse response safely
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// ------------------------------
// USER FETCH (Auto token refresh + Caching + Deduplication)
// ------------------------------
export async function apiFetch(endpoint, method = "GET", body = null, rawToken = null) {
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  const upperMethod = method.toUpperCase();
  const cacheKey = `${upperMethod}:${endpoint}`;

  // Clear cache on write operations
  if (upperMethod !== "GET") {
    clearApiCache();
  } else if (!rawToken) {
    // Check GET cache
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    // Deduplicate in-flight GET requests
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      const url = `${API_URL}/accounts${endpoint}`;
      const token = rawToken || (await getValidToken());

      const headers = {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const res = await fetch(url, {
        method: upperMethod,
        headers,
        body: body ? JSON.stringify(body) : null,
      });

      if (!res.ok) {
        if (res.status === 401) {
          ["access", "access_token", "refresh", "refresh_token"].forEach((k) => localStorage.removeItem(k));
          window.location.href = "/login";
        }
        const err = await safeJson(res).catch(() => ({}));
        throw new Error(err.detail || err.error || `API Error: ${res.status}`);
      }

      const data = await safeJson(res);
      if (upperMethod === "GET" && !rawToken) {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  if (upperMethod === "GET" && !rawToken) {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

// ------------------------------
// ADMIN JSON API (token required + auto refresh)
// ------------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;
  const upperMethod = method.toUpperCase();
  const cacheKey = `ADMIN:${upperMethod}:${endpoint}`;

  if (upperMethod !== "GET") {
    clearApiCache();
  } else {
    const cached = apiCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }
    if (pendingRequests.has(cacheKey)) {
      return pendingRequests.get(cacheKey);
    }
  }

  const fetchPromise = (async () => {
    try {
      const token = (await getValidToken()) || localStorage.getItem("admin_access_token") || localStorage.getItem("admin_access") || localStorage.getItem("access");
      if (!token) {
        window.location.href = "/admin-login";
        return;
      }

      const url = `${API_URL}/accounts${endpoint}`;

      const res = await fetch(url, {
        method: upperMethod,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: body ? JSON.stringify(body) : null,
      });

      if (!res.ok) {
        if (res.status === 401) {
          ["admin_access_token", "admin_refresh_token", "admin_access", "admin_refresh", "access", "refresh"].forEach((k) => localStorage.removeItem(k));
          window.location.href = "/admin-login";
        }
        const err = await safeJson(res).catch(() => ({}));
        throw new Error(err.detail || err.error || `Admin API error ${res.status}`);
      }

      const data = await safeJson(res);
      if (upperMethod === "GET") {
        apiCache.set(cacheKey, { data, timestamp: Date.now() });
      }
      return data;
    } finally {
      pendingRequests.delete(cacheKey);
    }
  })();

  if (upperMethod === "GET") {
    pendingRequests.set(cacheKey, fetchPromise);
  }

  return fetchPromise;
}

// ------------------------------
// ADMIN FORM API (file uploads)
// ------------------------------
export async function adminFetchForm(endpoint, method = "POST", formData) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  clearApiCache();
  const token = (await getValidToken()) || localStorage.getItem("admin_access_token") || localStorage.getItem("admin_access") || localStorage.getItem("access");
  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

  const url = `${API_URL}/accounts${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      ["admin_access_token", "admin_refresh_token", "admin_access", "admin_refresh"].forEach((k) => localStorage.removeItem(k));
      window.location.href = "/admin-login";
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `Admin Upload Error`);
  }

  return safeJson(res);
}
