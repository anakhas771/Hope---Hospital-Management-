// src/pages/DepartmentsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";
import { apiFetch } from "../lib/api";

const DepartmentsPage = () => {
  const { department } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch doctors filtered by department from backend
        const data = await apiFetch(`/doctors/?department=${department}`);
        if (Array.isArray(data)) {
          setDoctors(data);
        } else {
          setDoctors([]);
        }
      } catch (err) {
        console.error("Error fetching doctors:", err);
        setError(err.message || "Failed to fetch doctors");
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [department]);

  return (
    <div className="min-h-screen px-6 py-12 bg-gradient-to-b from-blue-800 via-blue-700 to-blue-800 text-white">
      <h2 className="text-3xl font-bold text-center mb-10">
        {department?.toUpperCase()} Department
      </h2>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 animate-pulse flex flex-col justify-between h-[280px]">
              <div className="w-20 h-20 rounded-full bg-white/20"></div>
              <div className="space-y-2 mt-4">
                <div className="h-5 bg-white/20 rounded w-3/4"></div>
                <div className="h-4 bg-white/15 rounded w-1/2"></div>
              </div>
              <div className="h-10 bg-white/20 rounded-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <p className="text-center text-red-400">{error}</p>
      ) : doctors.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {doctors.map((doc) => (
            <DoctorCard key={doc.id} doctor={doc} />
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-300">No doctors available.</p>
      )}
    </div>
  );
};

export default DepartmentsPage;
