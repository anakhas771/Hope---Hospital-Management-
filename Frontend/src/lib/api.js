// lib/api.js

// -------------------------------------------
// BASE API URL (from Vite env)
// -------------------------------------------
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// -------------------------------------------
// NORMAL USER API FETCH (Public/Frontend)
// Base URL ALWAYS points to /accounts
// -------------------------------------------
const BASE_URL = `${API_URL}/accounts`;

export async function apiFetch(endpoint, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }
  return res.json();
}

// -------------------------------------------
// ADMIN API FETCH (requires admin JWT)
// Used for Admin Dashboard CRUD
// -------------------------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("admin_access_token");

  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

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
    // Force logout if token expired
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
    }

    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || `API error ${res.status}`);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// -------------------------------------------
// ADMIN FORM UPLOAD (for images, files)
// MUST export correctly so Vite doesn't fail
// -------------------------------------------
export async function adminFetchForm(endpoint, method = "POST", formData) {
  const token = localStorage.getItem("admin_access_token");

  if (!token) {
    window.location.href = "/admin-login";
    return;
  }

  const url = `${API_URL}/accounts${endpoint}`;

  const res = await fetch(url, {
    method,
    headers: {
      // IMPORTANT: DO NOT set content-type for FormData
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("admin_access_token");
      localStorage.removeItem("admin_refresh_token");
      window.location.href = "/admin-login";
    }

    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || err.error || "Form upload error");
  }

  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ---------------------------------------------------
// 100% FIXED EXPORTS — Vite needs this!
// ---------------------------------------------------
export default {
  apiFetch,
  adminFetch,
  adminFetchForm,
};
