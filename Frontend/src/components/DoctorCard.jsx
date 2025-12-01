import React from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const DoctorCard = ({ doctor }) => {
  const navigate = useNavigate();

  const {
    id,
    name,
    specialization,
    education,
    experience,
    availability,
    rating,
    patients_count,
    profile_image, // still keeping (not required but ok)
    profile_image_url, // IMPORTANT: backend returns this
    department,
  } = doctor;

  // Generate initials if no image
  const initials =
    name
      ?.split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("") || "DR";

  // Handle booking
  const handleBook = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      alert("❌ You must be logged in to book an appointment.");
      navigate("/login");
      return;
    }
    navigate("/appointment", { state: doctor });
  };

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.03,
        boxShadow: "0 15px 25px rgba(0,0,0,0.25)",
      }}
      whileTap={{ scale: 0.97 }}
      className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 shadow-lg text-white flex flex-col justify-between transition-all"
    >
      {/* Doctor Image Section */}
      <div className="flex items-center gap-4">
        {profile_image_url ? (
          <img
            src={profile_image_url}
            alt={name}
            className="w-20 h-20 rounded-full object-cover border border-white/30"
          />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-lg font-bold">
            {initials}
          </div>
        )}
      </div>

      {/* Name & Specialization */}
      <div className="mt-3">
        <h3 className="text-lg font-semibold">{name}</h3>
        <p className="text-cyan-300 text-sm">{specialization}</p>
      </div>

      {/* Doctor Info */}
      <div className="mt-3 space-y-1 text-sm text-gray-200">
        {education && <p>🎓 {education}</p>}
        {experience && <p>🧑‍⚕️ {experience}</p>}
        {availability && <p>⏰ {availability}</p>}

        {(rating || patients_count) && (
          <div className="flex gap-4 pt-1 text-xs text-gray-300">
            {rating && <span>⭐ {rating}</span>}
            {patients_count && <span>👥 {patients_count} patients</span>}
          </div>
        )}
      </div>

      {/* Book Appointment Button */}
      <button
        onClick={handleBook}
        className="w-full py-2 mt-4 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 transition text-white font-semibold shadow-md"
      >
        Book Appointment
      </button>
    </motion.div>
  );
};

export default DoctorCard;
