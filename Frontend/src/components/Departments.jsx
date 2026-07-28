import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const departments = [
  { name: "Cardiology", icon: "❤️", description: "Comprehensive heart health & vascular care", color: "from-rose-500/20 to-pink-500/10" },
  { name: "Neurology", icon: "🧠", description: "Advanced brain & nervous system treatments", color: "from-indigo-500/20 to-purple-500/10" },
  { name: "Pediatrics", icon: "👶", description: "Compassionate child healthcare specialists", color: "from-amber-500/20 to-yellow-500/10" },
  { name: "Orthopedics", icon: "🦴", description: "Expert bone, joint & spinal surgical care", color: "from-cyan-500/20 to-blue-500/10" },
  { name: "Emergency", icon: "🚑", description: "24/7 immediate trauma & critical care response", color: "from-red-500/20 to-rose-600/10" },
  { name: "Radiology", icon: "🩻", description: "High-precision MRI, CT & diagnostic imaging", color: "from-emerald-500/20 to-teal-500/10" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 100 } },
};

const Departments = () => {
  const navigate = useNavigate();

  const handleCardClick = (deptName) => {
    navigate(`/departments/${deptName.toLowerCase()}`);
  };

  return (
    <section id="departments" className="py-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-3 font-heading tracking-tight">
          Specialized <span className="text-cyan-400">Departments</span>
        </h2>
        <p className="text-slate-300 text-base md:text-lg max-w-xl mx-auto font-sans">
          Delivering multidisciplinary clinical excellence with state-of-the-art facilities
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {departments.map((dept, index) => (
          <motion.div
            key={index}
            className={`glass-card glass-card-hover bg-gradient-to-br ${dept.color} p-7 flex flex-col items-center text-center cursor-pointer group relative overflow-hidden`}
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: index * 0.08 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleCardClick(dept.name)}
          >
            <motion.div
              className="text-5xl mb-4 p-4 rounded-2xl bg-white/5 border border-white/10 group-hover:scale-110 transition-transform shadow-inner"
              animate={{ y: [0, -6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: index * 0.2 }}
            >
              {dept.icon}
            </motion.div>
            <h3 className="text-xl font-bold text-white mb-2 font-heading tracking-wide group-hover:text-cyan-300 transition-colors">
              {dept.name}
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">{dept.description}</p>
            
            <div className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
              View Department & Doctors &rarr;
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default Departments;
