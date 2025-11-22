// src/pages/AdminLogin.jsx
import React, { useState } from "react";
import { API_URL } from "../lib/api";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr("");

    try {
      // Correct API endpoint: /accounts/admin-login/
      const res = await fetch(`${API_URL}/accounts/admin-login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErr(data.error || data.detail || "Invalid credentials");
        return;
      }

      // Save admin tokens
      localStorage.setItem("admin_access_token", data.access);
      localStorage.setItem("admin_refresh_token", data.refresh);

      navigate("/admin-dashboard");
    } catch (err) {
      setErr("Server error: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-xl"
      >
        <h1 className="text-2xl font-semibold text-white mb-6">Admin Login</h1>

        {err && <p className="text-red-400 mb-3">{err}</p>}

        <input
          type="email"
          placeholder="Admin Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full mb-3 px-4 py-2 rounded bg-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full mb-5 px-4 py-2 rounded bg-white/20 text-white placeholder-white/60 outline-none focus:ring-2 focus:ring-indigo-400"
        />

        <button className="w-full py-2 rounded bg-indigo-500 hover:bg-indigo-600 text-white font-semibold transition">
          Sign in
        </button>
      </form>
    </div>
  );
}
