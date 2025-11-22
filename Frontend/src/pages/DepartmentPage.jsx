import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DoctorCard from "../components/DoctorCard";

const DepartmentsPage = () => {
  const { department } = useParams();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch(`https://hope-backend-mvos.onrender.com/api/doctors/?department=${department}`);
        const data = await res.json();
        setDoctors(data);
      } catch (err) {
        console.error("Error fetching doctors:", err);
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
        <p className="text-center text-gray-300">Loading doctors...</p>
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