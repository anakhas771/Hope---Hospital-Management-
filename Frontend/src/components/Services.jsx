// src/components/Services.jsx
import React from "react";
import Lottie from "lottie-react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";

import ambulanceAnimation from "../assets/ambulance.json";
import qualifieddocAnimation from "../assets/qualifieddoc.json";
import hospitalAnimation from "../assets/hospital.json";
import pharmacyAnimation from "../assets/pharmacy.json";
import labAnimation from "../assets/lab.json";
import surgeryAnimation from "../assets/surgery.json";

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

const Services = () => {
  const services = [
    {
      animation: ambulanceAnimation,
      title: "24/7 Emergency Care",
      desc: "Immediate medical attention round-the-clock with advanced ambulance services.",
    },
    {
      animation: qualifieddocAnimation,
      title: "Expert Specialists",
      desc: "A team of highly qualified doctors across all major medical disciplines.",
    },
    {
      animation: hospitalAnimation,
      title: "Advanced Infrastructure",
      desc: "State-of-the-art facilities ensuring world-class medical care.",
    },
    {
      animation: pharmacyAnimation,
      title: "In-House Pharmacy",
      desc: "Fully stocked pharmacy with genuine medicines available anytime.",
    },
    {
      animation: labAnimation,
      title: "Diagnostic Laboratory",
      desc: "Accurate lab testing and diagnostics with modern equipment.",
    },
    {
      animation: surgeryAnimation,
      title: "Surgical Excellence",
      desc: "From minor procedures to advanced surgeries with precision and care.",
    },
  ];

  return (
    <section id="services" className=" px-6 relative">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
          Our Services
        </h1>
        <p className="text-base md:text-lg text-gray-200 max-w-2xl mx-auto">
          Comprehensive healthcare solutions designed with compassion, innovation, and excellence for every patient.
        </p>
      </motion.div>

      {/* Services Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto"
      >
        {services.map((service, index) => (
          <motion.div
            key={index}
            variants={cardVariants}
            whileHover={{
              scale: 1.05,
              boxShadow: "0px 0px 30px rgba(56,189,248,0.6)",
            }}
            className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 md:p-8 text-center text-white shadow-lg transition cursor-default"
          >
            <Lottie
              animationData={service.animation}
              loop={true}
              className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-5 md:mb-6"
            />
            <h2 className="text-xl md:text-2xl font-semibold mb-2 md:mb-3 text-cyan-300">
              {service.title}
            </h2>
            <p className="text-gray-300 text-sm md:text-base">{service.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
};

export default Services;