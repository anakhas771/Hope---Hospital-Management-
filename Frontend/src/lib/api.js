// src/lib/api.js
import { getValidToken } from "../utils/getToken";

export const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");
const BASE_URL = `${API_URL}/accounts`;

// Generic fetch used across frontend. Attaches valid token (refreshes if necessary).
export async function apiFetch(endpoint, method = "GET", body = null) {
  const token = await getValidToken();

  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    // Try to parse JSON error
    let errText;
    try {
      const json = await res.json();
      errText = json.detail || json.error || JSON.stringify(json);
    } catch {
      errText = await res.text();
    }
    throw new Error(errText || `API error ${res.status}`);
  }

  // Might be empty body
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Admin helpers (if you keep admin tokens separate)
export async function adminFetch(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("admin_access_token");
  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

  const res = await fetch(`${API_URL}/accounts${endpoint}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
    }
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `Admin API error ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
