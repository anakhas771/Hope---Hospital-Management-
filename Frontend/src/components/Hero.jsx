// src/components/Hero.jsx
import React from "react";
import Lottie from "lottie-react";
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
      className="px-4 md:px-8 pt-16 md:pt-24 lg:pt-28 pb-16 bg-transparent relative"
    >
      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left Content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-white space-y-6"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs md:text-sm font-semibold tracking-wide"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            24/7 Advanced Emergency & Specialized Medical Care
          </motion.div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-[1.1] tracking-tight font-heading">
            Compassionate Care, <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-blue-500">
              Modern Facilities.
            </span>
          </h1>

          <p className="text-base md:text-lg text-slate-300 max-w-xl font-sans leading-relaxed">
            At <strong className="text-white font-semibold">Hope Hospital</strong>, we unite cutting-edge medical technology with personalized clinical attention to ensure exemplary outcomes for every patient.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(14,165,233,0.45)" }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToDepartments}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white font-bold text-sm tracking-wide shadow-xl shadow-cyan-500/20 transition-all duration-300"
            >
              Explore Departments
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const sec = document.getElementById("services");
                if (sec) sec.scrollIntoView({ behavior: "smooth" });
              }}
              className="px-8 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 border border-white/15 font-semibold text-sm transition-all"
            >
              Our Services
            </motion.button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/10">
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-cyan-400 font-heading">150+</div>
              <div className="text-xs text-slate-400 font-medium">Expert Doctors</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-cyan-400 font-heading">24/7</div>
              <div className="text-xs text-slate-400 font-medium">Emergency Care</div>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-cyan-400 font-heading">25k+</div>
              <div className="text-xs text-slate-400 font-medium">Patients Served</div>
            </div>
          </div>
        </motion.div>

        {/* Right Animation */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex justify-center relative"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-blue-500/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
          <Lottie
            animationData={heroAnimation}
            loop
            className="w-[280px] md:w-[380px] lg:w-[460px] filter drop-shadow-[0_15px_30px_rgba(14,165,233,0.3)]"
          />
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;