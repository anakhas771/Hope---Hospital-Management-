// src/utils/getToken.js

function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}


// ✅ Main function: get a valid access token
export async function getValidToken() {
  let token = localStorage.getItem("access");
  const refresh = localStorage.getItem("refresh");

  if (!token && !refresh) {
    return null; // no tokens at all → user not logged in
  }

  // Check if access token expired
  const payload = parseJwt(token);
  const isExpired = !payload || payload.exp * 1000 < Date.now();

  if (isExpired && refresh) {
    return await refreshToken(refresh); // try to refresh
  }

  return token;
}

// ✅ Refresh using refresh token
async function refreshToken(refresh) {
  try {
    const res = await fetch("http://127.0.0.1:8000/accounts/auth/token/refresh/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });

    if (res.ok) {
      const data = await res.json();
      // Save new access token
      localStorage.setItem("access", data.access);
      console.log("🔄 Refreshed access token");
      return data.access;
    } else {
      const error = await res.json();
      console.error("❌ Refresh failed:", error);
      localStorage.clear(); // clear storage if refresh is invalid
      return null;
    }
  } catch (err) {
    console.error("Error refreshing token:", err);
    return null;
  }
}