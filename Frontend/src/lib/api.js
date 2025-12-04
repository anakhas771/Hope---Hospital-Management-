
//lib/api.js
import { getValidToken } from "../utils/getToken";

export const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");

async function safeJson(res) {
  const text = await res.text();
  try {
    return text ? JSON.parse(text) : null;
  } catch {
    return text;
  }
}

// ------------------------------
// USER FETCH
// ------------------------------
export async function apiFetch(endpoint, method = "GET", body = null, rawToken = null) {

  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const token = rawToken || (await getValidToken());

  const url = `${API_URL}/accounts${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : null,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    throw new Error("API error");
  }

  return safeJson(res);
}

// ------------------------------
// ADMIN FETCH
// ------------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const token = localStorage.getItem("admin_access_token");
  if (!token) return (window.location.href = "/admin-login");

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
      localStorage.removeItem("admin_access_token");
      window.location.href = "/admin-login";
    }
    throw new Error("Admin API error");
  }

  return safeJson(res);
}

// ------------------------------
// ADMIN FORM FETCH
// ------------------------------
export async function adminFetchForm(endpoint, method = "POST", formData) {
  if (!endpoint.startsWith("/")) endpoint = "/" + endpoint;

  const token = localStorage.getItem("admin_access_token");
  if (!token) return (window.location.href = "/admin-login");

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
      localStorage.removeItem("admin_access_token");
      window.location.href = "/admin-login";
    }
    throw new Error("Admin Upload Error");
  }

  return safeJson(res);
}
