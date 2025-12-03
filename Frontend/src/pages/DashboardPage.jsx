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

  if (!user) return <p className="text-center mt-10 text-white">Loading...</p>;

  const upcomingAppointments = appointments.filter(appt => new Date(appt.date_time) >= new Date());
  const pastAppointments = appointments.filter(appt => new Date(appt.date_time) < new Date());

  return (
    <div className="min-h-screen px-4 md:px-12 py-12 text-white bg-transparent">
      <Toaster position="bottom-center" />

      <div className="flex flex-col md:flex-row gap-8">

        {/* --------- Left Panel: Profile & Stats --------- */}
        <motion.div
          className="bg-white/10 backdrop-blur-xl p-8 rounded-2xl shadow-lg w-full md:w-1/3 border border-white/20 flex flex-col gap-6"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="text-2xl font-bold">{user.full_name}</h2>
          <p className="text-gray-300">{user.email}</p>
          <p className="text-gray-300">
            Member Since: {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
          </p>

          <div className="flex flex-col gap-4 mt-4">
            <div className="bg-white/20 p-4 rounded-xl shadow flex justify-between items-center">
              <span className="text-gray-200 font-medium">Upcoming</span>
              <span className="text-xl font-bold">{upcomingAppointments.length}</span>
            </div>
            <div className="bg-white/20 p-4 rounded-xl shadow flex justify-between items-center">
              <span className="text-gray-200 font-medium">Past</span>
              <span className="text-xl font-bold">{pastAppointments.length}</span>
            </div>
          </div>
        </motion.div>

        {/* --------- Right Panel: Appointments --------- */}
        <motion.div
          className="flex-1 flex flex-col gap-6"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          {/* Upcoming Appointments */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-center">Upcoming Appointments</h3>
            {loading ? <p className="text-center">Loading...</p> : upcomingAppointments.length ? (
              <ul className="space-y-2">
                {upcomingAppointments.map(appt => (
                  <li key={appt.id} className="bg-white/20 p-3 rounded-xl flex justify-between items-center text-gray-100 hover:bg-white/30 transition">
                    <span>{formatDate(appt.date_time)} - {appt.doctor}</span>
                    <span className="text-sm text-gray-300">{appt.status}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-gray-400">No upcoming appointments.</p>}
          </div>

          {/* Past Appointments */}
          <div className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-lg border border-white/20 flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-center">Past Appointments</h3>
            {loading ? <p className="text-center">Loading...</p> : pastAppointments.length ? (
              <ul className="space-y-2">
                {pastAppointments.map(appt => (
                  <li key={appt.id} className="bg-white/20 p-3 rounded-xl flex justify-between items-center text-gray-100 hover:bg-white/30 transition">
                    <span>{formatDate(appt.date_time)} - {appt.doctor}</span>
                    <span className="text-sm text-gray-300">{appt.status}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-center text-gray-400">No past appointments.</p>}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
