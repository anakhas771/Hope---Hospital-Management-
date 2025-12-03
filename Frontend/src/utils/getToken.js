// src/utils/getToken.js
const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");

// safe base64 decode for JWT payload (handles URL-safe base64)
function b64DecodeUnicode(str) {
  try {
    // replace url-safe chars
    str = str.replace(/-/g, "+").replace(/_/g, "/");
    // pad with '='
    while (str.length % 4) str += "=";
    return decodeURIComponent(
      atob(str)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return null;
  }
}

function parseJwt(token) {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = b64DecodeUnicode(parts[1]);
    return payload ? JSON.parse(payload) : null;
  } catch (err) {
    console.error("Invalid JWT:", err);
    return null;
  }
}

export async function getValidToken() {
  // read both possible storage keys
  const access = localStorage.getItem("access") || localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh") || localStorage.getItem("refresh_token");

  if (!access && !refresh) return null;
  if (!access && refresh) return await refreshToken(refresh);

  const payload = parseJwt(access);
  const isExpired = !payload || payload.exp * 1000 < Date.now();

  if (isExpired && refresh) {
    return await refreshToken(refresh);
  }

  return access;
}

async function refreshToken(refresh) {
  try {
    const res = await fetch(`${API_URL}/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      console.error("Refresh token invalid, clearing localStorage.");
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      return null;
    }

    const data = await res.json();
    const newAccess = data.access || data.access_token;
    if (newAccess) {
      localStorage.setItem("access", newAccess);
      console.log("🔄 Access token refreshed");
      return newAccess;
    }
    return null;
  } catch (err) {
    console.error("Refresh failed:", err);
    return null;
  }
}
