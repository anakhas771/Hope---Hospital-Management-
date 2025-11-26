// src/pages/SignUpPage.jsx
/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, X, LogIn } from "lucide-react";
import { API_URL } from "../lib/api";

const SignUpPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("Invalid email");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/accounts/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName,
          email: formData.email,
          password: formData.password,
          confirm_password: formData.confirmPassword,
        }),
      });

      const data = await res.json();
      console.log("Signup response:", data);

      if (res.ok) {
        setSuccess("Account created!Redirecting to login...");
        setFormData({
          fullName: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
         setTimeout(() => navigate("/login"), 800);
      } else {
        const msg = Object.values(data).flat().join(" ");
        setError(msg || "Signup failed.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      setError("Something went wrong.");
    }

    setLoading(false);
  };

  const inputVariant = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex flex-col lg:flex-row justify-center items-center min-h-screen text-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="relative bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 mt-10 lg:mt-0"
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
          Create Your Account
        </motion.h2>

        {error && <p className="text-red-400 text-sm mb-3 text-center">{error}</p>}
        {success && <p className="text-green-400 text-sm mb-3 text-center">{success}</p>}

        <motion.form
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <motion.input
            variants={inputVariant}
            type="text"
            name="fullName"
            placeholder="Full Name"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
          />

          <motion.input
            variants={inputVariant}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white"
          />

          <motion.div className="relative" variants={inputVariant}>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 text-white/70"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>

          <motion.div className="relative" variants={inputVariant}>
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg bg-white/20 text-white pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute inset-y-0 right-3 text-white/70"
            >
              {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </motion.div>

          <motion.button
            variants={inputVariant}
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full py-2 rounded-full bg-cyan-500 text-white font-semibold"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </motion.button>
        </motion.form>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-sm text-center mt-4 text-white/70 cursor-pointer flex items-center justify-center gap-2"
          onClick={() => navigate("/login")}
        >
          <LogIn size={18} /> Already have an account? Login
        </motion.p>
      </motion.div>
    </div>
  );
};

export default SignUpPage;
