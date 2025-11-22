// src/lib/api.js

export const API_URL =
  import.meta.env.VITE_API_URL || "https://hope-hospital-management.onrender.com/accounts";

// Generic API fetch
export async function apiFetch(endpoint, method = "GET", body = null, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.detail || error.error || "API request failed");
  }

  return res.json();
}

// Admin API fetch (JSON)
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

    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "API error");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Admin API fetch (FormData)
export async function adminFetchForm(endpoint, method = "POST", formData) {
  const token = localStorage.getItem("admin_access_token");
  if (!token) return (window.location.href = "/admin-login");

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers: { Authorization: `Bearer ${token}` }, // No content-type
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
    }

    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "API error");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}
