import React, { useState, useEffect, useMemo } from "react";
/* eslint-disable no-unused-vars */
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const user = useMemo(() => JSON.parse(localStorage.getItem("user")), []);

  const navLinks = useMemo(
    () => [
      { name: "Home", hash: "home", path: "/" },
      { name: "Services", hash: "services", path: "/" },
      { name: "Departments", hash: "departments", path: "/" },
      { name: "Contact", hash: "footer", path: "/" },
    ],
    []
  );

  const handleScrollOrNavigate = (link) => {
    if (location.pathname === "/") {
      const element = document.getElementById(link.hash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setActiveSection(link.hash);
      }
    } else {
      navigate(link.path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => setMenuOpen(false), [location]);

  return (
    <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 w-[94%] max-w-6xl">
      <div className="bg-slate-900/65 backdrop-blur-xl border border-white/12 rounded-full px-6 py-3 flex justify-between items-center shadow-2xl shadow-cyan-950/40">
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-cyan-500/30 group-hover:scale-105 transition-transform">
            H
          </div>
          <span className="text-xl font-bold tracking-tight text-white font-heading">
            HOPE <span className="text-cyan-400 font-light text-sm tracking-wide">HOSPITAL</span>
          </span>
        </div>

        <div className="hidden md:flex items-center space-x-8 text-slate-200 font-medium text-sm">
          {navLinks.map((link, i) => (
            <motion.button
              key={i}
              whileHover={{ y: -1, color: "#38bdf8" }}
              onClick={() => handleScrollOrNavigate(link)}
              className="relative py-1 transition-colors"
            >
              {link.name}
              {location.pathname === "/" && (
                <motion.span
                  className="absolute -bottom-0.5 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeSection === link.hash ? 1 : 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.25 }}
                />
              )}
            </motion.button>
          ))}
          {user && (
            <motion.button
              whileHover={{ y: -1, color: "#38bdf8" }}
              onClick={() => navigate("/dashboard")}
              className="py-1 transition-colors text-cyan-300 font-semibold"
            >
              Dashboard
            </motion.button>
          )}
        </div>

        <div className="hidden md:block">
          {user ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleLogout}
              className="px-5 py-2 rounded-full bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/20 text-sm font-semibold shadow-md transition-all"
            >
              Logout
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.04, boxShadow: "0 0 20px rgba(14,165,233,0.4)" }}
              whileTap={{ scale: 0.96 }}
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-semibold shadow-lg shadow-cyan-500/25 transition-all"
            >
              Sign In
            </motion.button>
          )}
        </div>

        <div className="md:hidden">
          {menuOpen ? (
            <X className="text-slate-200 w-6 h-6 cursor-pointer" onClick={() => setMenuOpen(false)} />
          ) : (
            <Menu className="text-slate-200 w-6 h-6 cursor-pointer" onClick={() => setMenuOpen(true)} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: -20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-3 bg-slate-900/90 backdrop-blur-2xl border border-white/12 rounded-3xl py-6 px-6 flex flex-col items-center space-y-5 text-slate-200 shadow-2xl"
          >
            {navLinks.map((link, i) => (
              <button
                key={i}
                onClick={() => handleScrollOrNavigate(link)}
                className="text-base font-medium hover:text-cyan-400 transition-colors"
              >
                {link.name}
              </button>
            ))}
            {user ? (
              <>
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-full py-2.5 rounded-full bg-cyan-500 text-slate-950 font-bold shadow-lg"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full py-2.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="w-full py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow-lg"
              >
                Sign In
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;