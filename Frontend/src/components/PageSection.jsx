// src/components/PageSection.jsx
import React, { useEffect } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

const PageSection = ({
  children,
  className = "py-24 px-6 max-w-7xl mx-auto text-white", // reduced top padding
}) => {
  // Scroll to top whenever this section is mounted
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <motion.section
      className={className}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.section>
  );
};

export default PageSection;