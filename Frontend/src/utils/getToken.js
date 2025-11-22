// src/utils/getToken.js

import { API_URL } from "../lib/api";

// -----------------------------
// Helper: Decode JWT payload
// -----------------------------
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}

// -----------------------------
// Main: Get a valid access token
// -----------------------------
export async function getValidToken() {
  let token = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // Not logged in
  if (!token && !refresh) return null;

  // Check token expiration
  const payload = parseJwt(token);
  const isExpired = !payload || payload.exp * 1000 < Date.now();

  if (isExpired && refresh) {
    // Try refreshing the token
    return await refreshToken(refresh);
  }

  return token;
}

// -----------------------------
// Refresh access token using refresh token
// -----------------------------
async function refreshToken(refresh) {
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      console.error("❌ Refresh token invalid, logging out");
      localStorage.clear();
      return null;
    }

    const data = await res.json();
    localStorage.setItem("access", data.access);
    console.log("🔄 Access token refreshed");
    return data.access;
  } catch (err) {
    console.error("Refresh failed:", err);
    return null;
  }
}
