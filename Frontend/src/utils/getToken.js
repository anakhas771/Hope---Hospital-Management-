// utils/getToken.js
const API_URL = (import.meta.env.VITE_API_URL || "https://hope-backend-mvos.onrender.com").replace(/\/$/, "");

function b64DecodeUnicode(str) {
  try {
    str = str.replace(/-/g, "+").replace(/_/g, "/");
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
  } catch {
    return null;
  }
}

export async function getValidToken() {
  const access = localStorage.getItem("access") || localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh") || localStorage.getItem("refresh_token");

  if (!access && !refresh) return null;
  if (!access && refresh) return await refreshToken(refresh);

  const payload = parseJwt(access);
  const expired = !payload || payload.exp * 1000 < Date.now();

  if (expired && refresh) {
    return await refreshToken(refresh);
  }

  return access;
}

async function refreshToken(refresh) {
  try {
    const res = await fetch(`${API_URL}/accounts/auth/token/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (!res.ok) {
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      localStorage.removeItem("user");
      return null;
    }

    const data = await res.json();
    if (data.access) {
      localStorage.setItem("access", data.access);
      return data.access;
    }
    return null;
  } catch {
    return null;
  }
}
