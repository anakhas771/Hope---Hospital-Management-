// src/utils/getToken.js
const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");

// -----------------------------
// Helper: Decode JWT payload
// -----------------------------
function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}

// -----------------------------
// Main: Get a valid access token
// -----------------------------
export async function getValidToken() {
  const access = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  // nothing stored
  if (!access && !refresh) return null;

  // if no access but refresh exists -> refresh
  if (!access && refresh) return await refreshToken(refresh);

  const payload = parseJwt(access);
  const isExpired = !payload || payload.exp * 1000 < Date.now();

  if (isExpired && refresh) {
    return await refreshToken(refresh);
  }

  return access;
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
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("access", data.access);
      console.log("🔄 Access token refreshed");
      return data.access;
    }

    return null;
  } catch (err) {
    console.error("Refresh failed:", err);
    return null;
  }
}
