// src/pages/CardiologyPage.jsx
import React, { useEffect, useState } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import DoctorCard from "../components/DoctorCard";
import PageSection from "../components/PageSection";
import { apiFetch } from "../lib/api";

const CardiologyPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const departmentName = "Cardiology";

  const services = [
    "ECG & Echocardiography",
    "Angiography & Angioplasty",
    "Bypass & Valve Surgery",
    "Electrophysiology",
    "Heart Failure & Rehab",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Correct backend endpoint
        const data = await apiFetch(`/doctors/?department=${departmentName}`);

        if (data && Array.isArray(data)) {
          setDoctors(data);
        } else {
          setDoctors([]);
        }
      } catch (err) {
        setError("Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  return (
    <PageSection>
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl font-bold mb-4">{departmentName}</h1>

        {/* Services */}
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {services.map((service, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm"
            >
              {service}
            </span>
          ))}
        </div>
      </motion.div>

      {/* Doctors List */}
      {loading ? (
        <p className="text-center text-gray-400">Loading doctors...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-400">
          No doctors found in {departmentName}
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {doctors.map((doctor) => (
            <motion.div
              key={doctor.id}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5 }}
            >
              <DoctorCard doctor={doctor} />
            </motion.div>
          ))}
        </div>
      )}
    </PageSection>
  );
};

export default CardiologyPage;
