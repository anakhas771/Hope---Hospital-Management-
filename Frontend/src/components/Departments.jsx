import React from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const departments = [
  { name: "Cardiology", icon: "❤️", description: "Heart care specialists" },
  { name: "Neurology", icon: "🧠", description: "Brain & nervous system" },
  { name: "Pediatrics", icon: "👶", description: "Child health experts" },
  { name: "Orthopedics", icon: "🦴", description: "Bone & joint care" },
  { name: "Emergency", icon: "🚑", description: "24/7 emergency care" },
  { name: "Radiology", icon: "🩻", description: "Imaging and diagnostics" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 100 } },
};

const Departments = () => {
  const navigate = useNavigate();

  const handleCardClick = (deptName) => {
    // Directly navigate without checking for user login
    navigate(`/departments/${deptName.toLowerCase()}`);
  };

  return (
    <section id="departments">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">Our Departments</h2>
        <p className="text-white/80">Providing specialized care across various medical fields</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 px-6 md:px-16">
        {departments.map((dept, index) => (
          <motion.div
            key={index}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 flex flex-col items-center text-center shadow-lg shadow-white/10 hover:shadow-blue-400/40 cursor-pointer"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(dept.name)}
          >
            <motion.div
              className="text-5xl mb-4"
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            >
              {dept.icon}
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">{dept.name}</h3>
            <p className="text-white/80">{dept.description}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Departments;
