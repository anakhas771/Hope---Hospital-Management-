// lib/api.js

// -------------------------------------------
// BASE API URL
// -------------------------------------------
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// ---------------------------------------------------
// NORMAL USER API FETCH (for frontend)
// Everything goes through /accounts/ correctly
// ---------------------------------------------------
const BASE_URL = "https://hope-backend-mvos.onrender.com/accounts";

export async function apiFetch(endpoint, method = "GET", body = null, token = null) {
  const headers = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText);
  }

  return res.json();
}


// ---------------------------------------------------
// ADMIN API FETCH (JWT secured)
// Used for dashboard login + CRUD
// ---------------------------------------------------
export async function adminFetch(endpoint, method = "GET", body = null) {
  const token = localStorage.getItem("admin_access_token");

  if (!token) {
    // If missing → redirect admin
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
    // auto logout on token expiry
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

// ---------------------------------------------------
// ADMIN FORM DATA FETCH (Uploads)
// ---------------------------------------------------
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
      Authorization: `Bearer ${token}`, // NO content-type for FormData
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
