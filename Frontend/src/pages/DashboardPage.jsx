/* eslint-disable no-unused-vars */
// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "../lib/api";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access");

    if (!storedUser || !access) {
      return navigate("/login");
    }

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
    } catch {
      navigate("/login");
    }
  }, []);

  const fetchAppointments = async (token, userId) => {
    try {
      setLoading(true);

      const data = await apiFetch(
        `/appointments/?user=${userId}`,
        "GET",
        null,
        token
      );

      const list = Array.isArray(data)
        ? data
        : data.appointments || [];

      const mapped = list.map((appt) => ({
        id: appt.id,
        doctor: appt.doctor?.name || "Unknown",
        date_time: appt.date_time,
        status: appt.status || "pending",
        amount: appt.amount || 0,
        payment_id: appt.payment_id || "",
        notes: appt.notes || "",
        created_at: appt.created_at,
      }));

      setAppointments(mapped);
    } catch (err) {
      toast.error("Session expired. Please login again.");
      localStorage.clear();
      navigate("/login");
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!user)
    return <p className="text-center mt-10 text-white">Loading...</p>;

  const upcoming = appointments.filter(
    (a) => new Date(a.date_time) >= new Date()
  );
  const past = appointments.filter(
    (a) => new Date(a.date_time) < new Date()
  );

  return (
    <div className="pt-20 px-4 md:px-10 text-white min-h-screen">
      <Toaster position="bottom-center" />

      {/* ---------------- HERO SECTION ---------------- */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 border border-white/20 p-8 rounded-3xl shadow-xl backdrop-blur-lg mb-10"
      >
        <h1 className="text-3xl md:text-4xl font-bold">
          Welcome, {user.full_name}
        </h1>
        <p className="text-gray-200 mt-2">
          Manage your appointments and stay updated.
        </p>
      </motion.div>

      {/* ---------------- PROFILE + STATS GRID ---------------- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/10 border border-white/20 p-6 rounded-2xl shadow-lg backdrop-blur-lg"
        >
          <h3 className="text-lg font-semibold mb-4">Your Profile</h3>
          <p><span className="font-semibold">Name:</span> {user.full_name}</p>
          <p><span className="font-semibold">Email:</span> {user.email}</p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 col-span-1 md:col-span-3 gap-4">
          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-lg shadow-lg">
            <h4 className="text-sm text-gray-300">Upcoming</h4>
            <p className="text-4xl font-bold">{upcoming.length}</p>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-lg shadow-lg">
            <h4 className="text-sm text-gray-300">Past</h4>
            <p className="text-4xl font-bold">{past.length}</p>
          </div>

          <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-lg shadow-lg">
            <h4 className="text-sm text-gray-300">Total</h4>
            <p className="text-4xl font-bold">{appointments.length}</p>
          </div>
        </div>
      </div>

      {/* ---------------- APPOINTMENT SECTIONS ---------------- */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {/* UPCOMING */}
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>

          {loading ? (
            <p>Loading...</p>
          ) : upcoming.length ? (
            <ul className="space-y-3">
              {upcoming.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-white/20 p-4 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{appt.doctor}</p>
                    <p className="text-sm text-gray-300">
                      {formatDate(appt.date_time)}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-green-500/80 text-white text-sm">
                    {appt.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming appointments.</p>
          )}
        </div>

        {/* PAST */}
        <div className="bg-white/10 p-6 rounded-2xl border border-white/20 backdrop-blur-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Past Appointments</h2>

          {loading ? (
            <p>Loading...</p>
          ) : past.length ? (
            <ul className="space-y-3">
              {past.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-white/20 p-4 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{appt.doctor}</p>
                    <p className="text-sm text-gray-300">
                      {formatDate(appt.date_time)}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-gray-400/70 text-white text-sm">
                    {appt.status}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No past appointments.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
