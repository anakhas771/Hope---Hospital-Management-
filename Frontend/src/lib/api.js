// src/lib/api.js
import { getValidToken } from "../utils/getToken";

export const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com")
  .replace(/\/$/, "");

// Safely parse JSON
async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// ----------------------------------------------------
// AUTO PREFIX HANDLER
// /accounts/*  → user JWT API
// /admin/*     → NO PREFIX (Django admin or admin API)
// ----------------------------------------------------
function resolveUrl(endpoint) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  // Only user APIs get /accounts prefix
  const prefix = endpoint.startsWith("/admin") ? "" : "/accounts";
  return `${API_URL}${prefix}${endpoint}`;
}

// ----------------------------------------------------
// USER FETCH (JWT)   → always under /accounts/
// ----------------------------------------------------
export async function apiFetch(endpoint, method = "GET", body = null, rawToken = null) {
  const url = resolveUrl(endpoint);

  // Use caller token or auto-refresh system
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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      window.location.href = "/login";
      return;
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `API Error ${res.status}`);
  }

  return safeJson(res);
}

// ----------------------------------------------------
// ADMIN JSON API (CUSTOM ADMIN API ONLY)
// NOT FOR DJANGO ADMIN LOGIN PAGE!
// ----------------------------------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const url = `${API_URL}${endpoint}`;

  const token = localStorage.getItem("admin_access_token");
  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

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
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
      return;
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `Admin API error ${res.status}`);
  }

  return safeJson(res);
}

// ----------------------------------------------------
// ADMIN FORM UPLOAD API (file uploads)
// ----------------------------------------------------
export async function adminFetchForm(endpoint, method = "POST", formData) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const token = localStorage.getItem("admin_access_token");
  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

  const url = `${API_URL}${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${token}`, // Note: NO content-type here
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      window.location.href = "/admin-login";
      return;
    }
    const err = await safeJson(res).catch(() => ({}));
    throw new Error(err.detail || err.error || `Admin Upload Error`);
  }

  return safeJson(res);
}
