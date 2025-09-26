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
    <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-6xl">
      <div className="bg-white/20 backdrop-blur-md border border-white/20 rounded-full px-6 py-3 flex justify-between items-center shadow-lg shadow-white/10">
        <div
          className="text-2xl font-extrabold text-white tracking-wide cursor-pointer"
          onClick={() => navigate("/")}
        >
          HOPE
        </div>

        <div className="hidden md:flex space-x-8 text-white font-medium">
          {navLinks.map((link, i) => (
            <motion.button
              key={i}
              whileHover={{ scale: 1.1, color: "#60A5FA" }}
              onClick={() => handleScrollOrNavigate(link)}
              className="relative"
            >
              {link.name}
              {location.pathname === "/" && (
                <motion.span
                  className="absolute -bottom-1 left-0 w-full h-[2px] bg-blue-400"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: activeSection === link.hash ? 1 : 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.3 }}
                />
              )}
            </motion.button>
          ))}
          {user && (
            <>
              <motion.button onClick={() => navigate("/dashboard")} className="ml-4">
                Dashboard
              </motion.button>
              
            </>
          )}
        </div>

        <div className="hidden md:block">
          {user ? (
            <motion.button
              onClick={handleLogout}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              Logout
            </motion.button>
          ) : (
            <motion.button
              onClick={() => navigate("/login")}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold shadow-lg hover:shadow-xl"
            >
              Login
            </motion.button>
          )}
        </div>

        <div className="md:hidden">
          {menuOpen ? (
            <X className="text-white w-7 h-7 cursor-pointer" onClick={() => setMenuOpen(false)} />
          ) : (
            <Menu className="text-white w-7 h-7 cursor-pointer" onClick={() => setMenuOpen(true)} />
          )}
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="md:hidden mt-4 bg-white/20 backdrop-blur-lg border border-white/20 rounded-2xl py-6 flex flex-col items-center space-y-6 text-white shadow-lg"
          >
            {navLinks.map((link, i) => (
              <button key={i} onClick={() => handleScrollOrNavigate(link)} className="text-lg hover:text-blue-300">
                {link.name}
              </button>
            ))}
            {user ? (
              <>
                <button onClick={() => navigate("/dashboard")} className="px-6 py-2 rounded-full bg-cyan-500 text-white font-semibold shadow-lg">Dashboard</button>
                <button onClick={handleLogout} className="px-6 py-2 rounded-full bg-red-500 text-white font-semibold shadow-lg">Logout</button>
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="px-6 py-2 rounded-full bg-blue-500 text-white font-semibold shadow-lg">Login</button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;