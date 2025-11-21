// src/pages/LoginPage.jsx
import React, { useState, useEffect } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, X } from "lucide-react";
import PageSection from "../components/PageSection";
import toast, { Toaster } from "react-hot-toast";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Show success message if redirected after email verification
    const query = new URLSearchParams(location.search);
    if (query.get("verified") === "true") {
      toast.success("✅ Email verified! You can now log in.");
    } else if (query.get("verified") === "false") {
      toast.error("❌ Invalid verification link.");
    }
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const res = await fetch("http://127.0.0.1:8000/accounts/auth/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData), // email + password
    });

    const data = await res.json();

    if (res.ok) {
      const userWithToken = { ...data.user, token: data.access };
      localStorage.setItem("user", JSON.stringify(userWithToken));

      toast.success("✅ Login successful!");
      navigate("/dashboard");
    } else {
      toast.error(
        data.error ||
        data.detail ||
        data.non_field_errors?.[0] ||
        "❌ Invalid credentials"
      );
    }
  } catch (err) {
    console.error("⚠️ Login failed:", err);
    toast.error("Network error, try again later");
  }
};


  const inputVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <PageSection className="pt-8 md:pt-16 px-6 flex justify-center items-start min-h-screen">
  <Toaster position="top-center" reverseOrder={false} /> {/* Toast container at top */}

  <motion.div
    initial={{ opacity: 0, y: 80, scale: 0.9 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
    className="relative bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 -mt-26 md:-mt-8"
  >
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 text-white/70 hover:text-white"
        >
          <X size={24} />
        </button>

        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-6 text-center text-white/90"
        >
          Welcome Back
        </motion.h2>

        <p className="text-center text-white/70 mb-6">
          Login to access your dashboard
        </p>

        <motion.form
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } },
          }}
          onSubmit={handleLogin}
          className="space-y-5"
        >
          <motion.input
            variants={inputVariant}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/70"
            autoComplete="username"
          />

          <motion.div className="relative" variants={inputVariant}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white placeholder-white/70 pr-10"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center text-white/70 hover:text-cyan-300 transition-colors"
            >
              {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
            </button>
          </motion.div>

          <motion.button
            variants={inputVariant}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 25px rgba(14,165,233,0.5)",
            }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full py-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold shadow-lg shadow-cyan-400/40 transition-all"
          >
            Login
          </motion.button>
        </motion.form>

        <div className="mt-4 text-center space-y-2">
          <p
            className="text-sm text-white/70 cursor-pointer hover:text-cyan-300 transition-colors"
            onClick={() => navigate("/forgot-password")}
          >
            Forgot your password?
          </p>
          <p
            className="text-sm text-white/70 cursor-pointer hover:text-cyan-300 transition-colors"
            onClick={() => navigate("/signup")}
          >
            Don’t have an account? Sign Up
          </p>
        </div>
      </motion.div>
    </PageSection>
  );
};

export default LoginPage;