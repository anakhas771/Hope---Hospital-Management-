// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "../lib/api";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // -------------------- Load User --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access");

    if (!storedUser || !access) return;

    try {
      const userData = JSON.parse(storedUser);

      const finalUser = {
        ...userData,
        token: access,
        full_name:
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
          userData.name ||
          userData.full_name ||
          "",
      };

      setUser(finalUser);
      fetchAppointments(access, userData.id);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // -------------------- Fetch Appointments --------------------
  const fetchAppointments = async (token, userId) => {
    try {
      setLoading(true);
      const data = await apiFetch(`/appointments/?user=${userId}`, "GET", null, token);
      const list = Array.isArray(data) ? data : data.appointments || [];
      const mapped = list.map((appt) => ({
        id: appt.id,
        doctor: appt.doctor?.name || "Unknown",
        date_time: appt.date_time,
        status: appt.status || "pending",
      }));
      setAppointments(mapped);
    } catch (err) {
      toast.error("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleString("en-IN", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.date_time) >= new Date()
  );

  const pastAppointments = appointments.filter(
    (appt) => new Date(appt.date_time) < new Date()
  );

  if (!user) return <p className="text-center mt-10 text-white">Loading...</p>;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-white">
      <Toaster position="bottom-center" />

      {/* ---------- Profile Card ---------- */}
      <motion.div
        className="bg-white/10 backdrop-blur-lg p-10 rounded-3xl shadow-lg text-center w-full max-w-md border border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold mb-4">{user.full_name}</h2>
        <p className="text-gray-300 mb-2">{user.email}</p>
        <p className="text-gray-300">
          Member Since: {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
        </p>
      </motion.div>

      {/* ---------- Stats Cards ---------- */}
      <div className="flex flex-col md:flex-row gap-6 mt-8 w-full max-w-3xl justify-center">
        <motion.div
          className="bg-white/10 p-6 rounded-2xl shadow-lg flex-1 text-center border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold mb-2">Upcoming Appointments</h3>
          <p className="text-4xl font-bold">{upcomingAppointments.length}</p>
        </motion.div>

        <motion.div
          className="bg-white/10 p-6 rounded-2xl shadow-lg flex-1 text-center border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold mb-2">Past Appointments</h3>
          <p className="text-4xl font-bold">{pastAppointments.length}</p>
        </motion.div>
      </div>

      {/* ---------- Appointments List ---------- */}
      <div className="w-full max-w-3xl mt-8 space-y-6">
        <motion.div
          className="bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-2xl font-semibold mb-4 text-center">Upcoming Appointments</h3>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : upcomingAppointments.length ? (
            <ul className="space-y-3">
              {upcomingAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="p-3 rounded-lg bg-white/20 flex justify-between items-center"
                >
                  <span>{formatDate(appt.date_time)} - {appt.doctor} ({appt.status})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-300">No upcoming appointments.</p>
          )}
        </motion.div>

        <motion.div
          className="bg-white/10 p-6 rounded-2xl shadow-lg border border-white/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-2xl font-semibold mb-4 text-center">Past Appointments</h3>
          {loading ? (
            <p className="text-center">Loading...</p>
          ) : pastAppointments.length ? (
            <ul className="space-y-3">
              {pastAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="p-3 rounded-lg bg-white/20 flex justify-between items-center"
                >
                  <span>{formatDate(appt.date_time)} - {appt.doctor} ({appt.status})</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-300">No past appointments.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
