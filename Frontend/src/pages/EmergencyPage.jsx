import React, { useEffect, useState } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import DoctorCard from "../components/DoctorCard";
import PageSection from "../components/PageSection";
import { apiFetch } from "../lib/api";

const EmergencyPage = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const departmentName = "Emergency Department";

  const services = [
    "Trauma Care",
    "Cardiac & Stroke Emergencies",
    "Accident & Injury Management",
    "24/7 Emergency Response",
    "Critical Care & ICU",
  ];

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const data = await apiFetch(`/doctors/?department=${departmentName}`);
        setDoctors(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to fetch doctors");
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
        <p className="text-gray-200 max-w-3xl mx-auto">
          24/7 emergency care with expert doctors ready to handle trauma, critical cases, and urgent medical situations.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          {services.map((s, i) => (
            <span key={i} className="px-3 py-1 rounded-full bg-white/10 border border-white/20 text-sm">
              {s}
            </span>
          ))}
        </div>
      </motion.div>

      {loading ? (
        <p className="text-center text-gray-400">Loading doctors...</p>
      ) : error ? (
        <p className="text-center text-red-500">{error}</p>
      ) : doctors.length === 0 ? (
        <p className="text-center text-gray-400">No doctors found in {departmentName}</p>
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

export default EmergencyPage;