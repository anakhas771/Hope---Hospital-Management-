// src/pages/ChangePasswordPage.jsx
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import PageSection from "../components/PageSection";
import { toast, Toaster } from "react-hot-toast";

const ChangePasswordPage = () => {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`https://hope-backend-mvos.onrender.com/accounts/auth/change-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, new_password: password, confirm_password: confirmPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Password successfully changed! Redirecting to login...");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        const msg = data.detail || data.error || "Something went wrong";
        toast.error(`❌ ${msg}`);
      }
    } catch (err) {
      toast.error("⚠️ Network error. Try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageSection className="pt-32 px-6 flex justify-center items-start min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />

      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 mt-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white/90">
          Reset Password
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/70"
            required
          />
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 focus:outline-none focus:ring-2 focus:ring-blue-400 text-white placeholder-white/70"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition shadow-lg shadow-blue-400/30 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Changing..." : "Change Password"}
          </motion.button>
        </form>
      </motion.div>
    </PageSection>
  );
};

export default ChangePasswordPage;