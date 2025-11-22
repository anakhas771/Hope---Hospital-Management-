// src/pages/ForgotPasswordPage.jsx
import React, { useState } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogIn, X } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import PageSection from "../components/PageSection";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("https://hope-backend-mvos.onrender.com/accounts/auth/reset-password/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data.email || "Something went wrong";
        toast.error(`❌ ${msg}`);
      } else {
        setSubmitted(true);
        toast.success("✅ Reset link sent if email exists");
      }
    } catch (err) {
      console.error("Password reset failed:", err);
      toast.error("⚠️ Network error. Try again later.");
    }

    setLoading(false);
  };

  const inputVariant = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };

  return (
    <PageSection className="pt-32 px-6 flex justify-center items-start min-h-screen">
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative bg-white/10 backdrop-blur-lg p-10 rounded-2xl shadow-2xl w-full max-w-md border border-white/20 mt-10"
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
          className="text-2xl font-bold mb-6 text-center text-white/90"
        >
          Forgot Password
        </motion.h2>

        {!submitted ? (
          <motion.form
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <motion.input
              variants={inputVariant}
              whileFocus={{ scale: 1.02 }}
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/20 placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-purple-400 text-white"
              required
            />

            <motion.button
              variants={inputVariant}
              whileHover={{
                scale: 1.05,
                backgroundColor: "#8B5CF6",
                boxShadow: "0px 8px 15px rgba(139, 92, 246, 0.4)",
              }}
              whileTap={{ scale: 0.95, rotate: -1 }}
              type="submit"
              className="w-full py-2 rounded-full bg-purple-600 text-white font-semibold transition-shadow shadow-lg shadow-purple-400/30"
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </motion.button>
          </motion.form>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="mt-6 px-4 py-2 rounded-xl bg-green-500/20 text-green-100 backdrop-blur-md border border-green-400/30 shadow-lg text-center text-sm"
            >
              ✅ If an account with this email exists, a reset link has been sent.
            </motion.div>
          </AnimatePresence>
        )}

        <motion.p
          whileHover={{ scale: 1.05, color: "#FFFFFF" }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center justify-center gap-2 text-sm mt-6 text-white/70 cursor-pointer"
          onClick={() => navigate("/login")}
        >
          <LogIn size={18} /> Back to Login
        </motion.p>
      </motion.div>
    </PageSection>
  );
};

export default ForgotPasswordPage;