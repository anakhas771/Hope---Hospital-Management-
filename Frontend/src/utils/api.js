// src/lib/api.js

// BASE URL CONFIG
export const API_URL =
  import.meta.env.VITE_API_URL ;

// -----------------------------
// Helper: Safe JSON parse
// -----------------------------
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch (err) {
    return text;
  }
}

// -----------------------------
// User API Fetch (JSON)
// -----------------------------
export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("access");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${API_URL}/accounts${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const err = await safeJson(res).catch(() => ({}));
    if (res.status === 401) {
      localStorage.removeItem("access");
      window.location.href = "/login";
    }
    throw new Error(err.detail || err.error || `API Error: ${res.status}`);
  }

  return safeJson(res);
}

// -----------------------------
// Admin API Fetch (JSON)
// -----------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("admin_access_token");
  if (!token) return (window.location.href = "/admin-login");

  const res = await fetch(`${API_URL}${endpoint}`, {
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
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || "API error");
  }

  return safeJson(res);
}

// -----------------------------
// Admin API Fetch with FormData (file uploads)
// -----------------------------
export async function adminFetchForm(endpoint, method = "POST", formData) {
  const token = localStorage.getItem("admin_access_token");
  if (!token) return (window.location.href = "/admin-login");

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}` }, // DO NOT set Content-Type for FormData
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || "API error");
  }

  return safeJson(res);
}
