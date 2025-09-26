// src/components/Hero.jsx
import React from "react";
import Lottie from "lottie-react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import heroAnimation from "../assets/hero.json";

const Hero = () => {
  const scrollToDepartments = () => {
    const section = document.getElementById("departments");
    if (section) section.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
 className="px-6 pt-16 md:pt-24 lg:pt-32 pb-24 bg-transparent"    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
        {/* Left Text */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-white space-y-6"
        >
          <h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
            style={{ fontFamily: "var(--font-heading)" }}
          >
            Compassionate Care, <br /> Modern Facilities
          </h1>

          <p
            className="text-lg md:text-xl text-white/80 max-w-xl"
            style={{ fontFamily: "var(--font-body)" }}
          >
            At <span className="font-semibold">Hope Hospital</span>, we combine
            advanced medical technology with personal care to ensure the best
            outcomes for our patients.
          </p>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: "#2563eb" }}
            whileTap={{ scale: 0.95 }}
            onClick={scrollToDepartments}
            className="mt-4 px-8 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-lg shadow-blue-500/30 transition-colors duration-300"
            style={{ fontFamily: "var(--font-body)" }}
          >
            Explore Departments
          </motion.button>
        </motion.div>

        {/* Right Animation */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="flex justify-center"
        >
          <Lottie
            animationData={heroAnimation}
            loop
            className="w-[300px] md:w-[400px] lg:w-[500px]"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;