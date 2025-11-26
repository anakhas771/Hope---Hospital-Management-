/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PageSection from "../components/PageSection";
import { toast, Toaster } from "react-hot-toast";
import { API_URL } from "../lib/api";

const ChangePasswordPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("❌ Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("access");
      if (!token) {
        toast.error("You must be logged in");
        return;
      }

      const res = await fetch(`${API_URL}/accounts/auth/change-password/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          new_password: newPassword,
          confirm_password: confirmPassword,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Password changed successfully!");
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast.error(data.detail || "Something went wrong");
      }
    } catch (error) {
      toast.error("⚠️ Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageSection className="pt-32 px-6 flex justify-center items-start min-h-screen">
      <Toaster position="top-center" />

      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="bg-white/10 backdrop-blur-lg p-10 rounded-2xl w-full max-w-md border border-white/20 shadow-xl mt-10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white/90">
          Change Password
        </h2>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/20 outline-none"
            required
          />

          <motion.input
            whileFocus={{ scale: 1.02 }}
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/20 outline-none"
            required
          />

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg bg-blue-500 hover:bg-blue-600 font-semibold shadow-md ${
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
