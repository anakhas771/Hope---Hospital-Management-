// src/components/Footer.jsx
import React from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";

const footerLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/#about" },
  { name: "Services", path: "/#services" },
  { name: "Departments", path: "/#departments" },
  { name: "Contact", path: "/#contact" },
];

const Footer = () => {
  return (
    <footer id="footer" className="mt-16 max-w-7xl mx-auto px-4 md:px-8">
      <div className="glass-card p-8 md:p-12 text-slate-100 relative overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Branding */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-base">
                H
              </div>
              <h2 className="text-xl font-bold font-heading text-white tracking-wide">
                Hope Hospital
              </h2>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              Providing world-class healthcare with compassion, innovation, and cutting-edge technology. Your health is our highest priority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-base font-bold font-heading text-cyan-400 mb-3 tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm text-slate-300">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 4, color: "#38bdf8" }}
                  transition={{ duration: 0.2 }}
                  className="cursor-pointer transition-colors"
                >
                  <Link to={link.path}>{link.name}</Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-base font-bold font-heading text-cyan-400 mb-3 tracking-wide">Contact Us</h3>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex items-center space-x-2.5">
                <Phone size={16} className="text-cyan-400" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail size={16} className="text-cyan-400" />
                <span>info@hopehospital.com</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Clock size={16} className="text-cyan-400" />
                <span>24/7 Emergency & OPD (Mon-Sat)</span>
              </li>
            </ul>
          </div>

          {/* Location Map */}
          <div>
            <h3 className="text-base font-bold font-heading text-cyan-400 mb-3 tracking-wide">Our Location</h3>
            <div className="overflow-hidden rounded-xl shadow-lg border border-white/10">
              <iframe
                title="Hope Hospital Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.123456789!2d76.123456!3d10.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b08123456789abc%3A0xabcdef123456789!2sHope+Hospital!5e0!3m2!1sen!2sin!4v1692981234567!5m2!1sen!2sin"
                width="100%"
                height="130"
                className="border-0 filter grayscale opacity-90 hover:grayscale-0 transition-all duration-300"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex justify-center space-x-6 mt-8 pt-6 border-t border-white/10">
          {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ scale: 1.2, color: "#38bdf8" }}
              className="cursor-pointer text-slate-300 hover:text-cyan-400 transition-colors"
            >
              <Icon size={20} />
            </motion.a>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          © {new Date().getFullYear()} Hope Hospital. All rights reserved. Built with precision and care.
        </div>
      </div>
    </footer>
  );
};

export default Footer;