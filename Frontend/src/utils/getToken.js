// src/utils/getToken.js

import { API_URL } from "../lib/api";

// Decode JWT payload
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

// ✅ Main function: return a valid access token (refresh if expired)
export async function getValidToken() {
  let token = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!token && !refresh) {
    return null; // Not logged in
  }

  const payload = parseJwt(token);
  const isExpired = !payload || payload.exp * 1000 < Date.now();

  if (isExpired && refresh) {
    return await refreshToken(refresh);
  }

  return token;
}

// ✅ Refresh access token using refresh token
async function refreshToken(refresh) {
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("access", data.access);
      console.log("🔄 Access token refreshed");
      return data.access;
    } else {
      localStorage.clear();
      console.error("❌ Refresh token invalid");
      return null;
    }
  } catch (err) {
    console.error("Refresh failed:", err);
    return null;
  }
}
