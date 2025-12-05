// src/lib/api.js
import { getValidToken } from "../utils/getToken";

export const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");

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
// USER FETCH (Auto token refresh)
// ------------------------------
export async function apiFetch(endpoint, method = "GET", body = null, rawToken = null) {
  if (!endpoint.startsWith("/")) {
    endpoint = "/" + endpoint;
  }

  const url = `${API_URL}/accounts${endpoint}`;

  const token = rawToken || (await getValidToken());

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    if (res.status === 401) {
      ["access","access_token","refresh","refresh_token"].forEach(k => localStorage.removeItem(k));
      window.location.href = "/login";
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `API Error: ${res.status}`);
  }

  return safeJson(res);
}

// ------------------------------
// ADMIN JSON API (token required)
// ------------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  // canonical admin keys
  const token = localStorage.getItem("admin_access_token") || localStorage.getItem("admin_access") || localStorage.getItem("access");
  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

  // IMPORTANT: admin endpoints live under /accounts/ on your backend
  const url = `${API_URL}/accounts${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    if (res.status === 401) {
      ["admin_access_token","admin_refresh_token","admin_access","admin_refresh"].forEach(k => localStorage.removeItem(k));
      window.location.href = "/admin-login";
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `Admin API error ${res.status}`);
  }

  return safeJson(res);
}

// ------------------------------
// ADMIN FORM API (file uploads)
// ------------------------------
export async function adminFetchForm(endpoint, method = "POST", formData) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const token = localStorage.getItem("admin_access_token") || localStorage.getItem("admin_access");
  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

  const url = `${API_URL}/accounts${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`, // DO NOT set content-type
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `Admin Upload Error`);
  }

  return safeJson(res);
}
