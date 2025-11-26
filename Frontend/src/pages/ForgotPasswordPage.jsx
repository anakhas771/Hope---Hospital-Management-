/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogIn, X } from "lucide-react";
import PageSection from "../components/PageSection";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // For this flow, we skip sending an email entirely
    if (!email) {
      setError("Please enter your email");
      return;
    }

    // Directly redirect user to change password page
    // Optionally, you can pass email in state
    navigate("/change-password", { state: { email } });
  };

  return (
    <PageSection className="pt-32 px-6 flex justify-center items-start min-h-screen">
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

        <h2 className="text-2xl font-bold mb-6 text-center text-white/90">
          Forgot Password
        </h2>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-xl bg-red-500/20 text-red-100 backdrop-blur-md border border-red-400/30 shadow-lg text-center text-sm">
            ⚠️ {error}
          </div>
        )}

        <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            className="p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button
            type="submit"
            className="p-3 rounded-lg bg-yellow-500 text-white font-semibold hover:bg-yellow-600 transition"
          >
            Proceed to Change Password
          </button>
        </form>

        <motion.p
          whileHover={{ scale: 1.05 }}
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
