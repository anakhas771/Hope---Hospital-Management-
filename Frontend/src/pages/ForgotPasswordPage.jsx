/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LogIn, X } from "lucide-react";
import PageSection from "../components/PageSection";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();

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

        <div className="mt-6 px-4 py-6 rounded-xl bg-yellow-500/20 text-yellow-100 backdrop-blur-md border border-yellow-400/30 shadow-lg text-center text-sm">
          ⚠️ Password reset via email is disabled. Please contact support to
          change your password.
        </div>

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
