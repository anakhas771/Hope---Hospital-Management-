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
    <footer id="footer" className="mt-20">
      <div className="bg-white/10 backdrop-blur-lg border-t border-white/20 text-white px-6 md:px-16 py-10 rounded-t-2xl">
        <div className="grid md:grid-cols-4 gap-10">
          {/* Branding */}
          <div>
            <h2 className="text-2xl font-bold mb-3">Hope Hospital</h2>
            <p className="text-white/80 text-sm leading-relaxed">
              Providing world-class healthcare with compassion, innovation, and
              cutting-edge technology. Your health is our priority.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.map((link, index) => (
                <motion.li
                  key={index}
                  whileHover={{ x: 5, color: "#38bdf8" }}
                  transition={{ duration: 0.3 }}
                  className="cursor-pointer transition"
                >
                  <Link to={link.path}>{link.name}</Link>
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-white/80">
              <li className="flex items-center space-x-2">
                <Phone size={18} />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail size={18} />
                <span>info@hopehospital.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <Clock size={18} />
                <span>Mon - Sat: 8:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>

          {/* Location Map */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Our Location</h3>
            <div className="overflow-hidden rounded-xl shadow-lg border border-white/20">
              <iframe
                title="Hope Hospital Location"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.123456789!2d76.123456!3d10.123456!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b08123456789abc%3A0xabcdef123456789!2sHope+Hospital!5e0!3m2!1sen!2sin!4v1692981234567!5m2!1sen!2sin"
                width="100%"
                height="150"
                className="border-0"
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="flex justify-center space-x-6 mt-10">
          {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
            <motion.a
              key={i}
              href="#"
              whileHover={{ scale: 1.2, color: "#38bdf8" }}
              className="cursor-pointer"
            >
              <Icon size={24} />
            </motion.a>
          ))}
        </div>

        {/* Bottom Note */}
        <div className="border-t border-white/20 mt-8 pt-4 text-center text-sm text-white/70">
          © {new Date().getFullYear()} Hope Hospital. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;