/* eslint-disable no-unused-vars */
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

  // ---------------- LOAD USER ----------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access");

    if (!storedUser || !access) {
      return navigate("/login");
    }

    try {
      const userData = JSON.parse(storedUser);
      setUser({
        ...userData,
        token: access,
        full_name:
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
          userData.name ||
          userData.full_name ||
          "",
      });

      fetchAppointments(access, userData.id);
    } catch (err) {
      navigate("/login");
    }
  }, []);

  // ------------------- FETCH APPOINTMENTS -------------------
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
        amount: appt.amount || 0,
        payment_status: appt.payment_status || "",
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

  // --------------- CANCEL APPOINTMENT ---------------
  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled-temp" } : a))
    );

    toast.success("Appointment cancelled temporarily (Undo available)");
  };

  // --------------- DATE FORMAT ---------------
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
    return (
      <p className="text-center mt-20 text-white text-xl">Loading user...</p>
    );

  const upcoming = appointments.filter(
    (a) => new Date(a.date_time) >= new Date() && a.status !== "cancelled-temp"
  );

  const past = appointments.filter(
    (a) => new Date(a.date_time) < new Date() && a.status !== "cancelled-temp"
  );

  return (
    <div className="min-h-screen flex text-white bg-gradient-to-b from-black via-[#0f0f0f] to-black">
      <Toaster position="bottom-center" />

      {/* ------------------ SIDEBAR ------------------ */}
      <aside className="hidden md:flex flex-col w-64 p-6 bg-white/10 backdrop-blur-xl border-r border-white/20">
        <h2 className="text-2xl font-semibold mb-8">Dashboard</h2>

        <div className="p-4 bg-white/10 rounded-xl border border-white/20 mb-8">
          <p className="text-lg font-semibold">{user.full_name}</p>
          <p className="text-sm text-gray-300">{user.email}</p>
        </div>

        <nav className="flex flex-col gap-4">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-left py-2 px-4 rounded-lg bg-blue-500/20 border border-blue-400/30"
          >
            Appointments
          </button>

          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="text-left py-2 px-4 rounded-lg bg-red-500/20 border border-red-400/30"
          >
            Logout
          </button>
        </nav>
      </aside>

      {/* ------------------ MAIN CONTENT ------------------ */}
      <main className="flex-1 p-6 md:p-10">

        {/* ----------- HEADER (visible on mobile) ----------- */}
        <div className="md:hidden mb-6">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <p className="text-gray-300">{user.full_name}</p>
        </div>

        {/* ----------------- STATS SECTION ----------------- */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <div className="p-5 rounded-xl bg-white/10 border border-white/20">
            <p className="text-lg">Upcoming</p>
            <p className="text-3xl font-bold">{upcoming.length}</p>
          </div>

          <div className="p-5 rounded-xl bg-white/10 border border-white/20">
            <p className="text-lg">Past</p>
            <p className="text-3xl font-bold">{past.length}</p>
          </div>

          <div className="p-5 rounded-xl bg-white/10 border border-white/20">
            <p className="text-lg">Total</p>
            <p className="text-3xl font-bold">{appointments.length}</p>
          </div>

          <div className="p-5 rounded-xl bg-white/10 border border-white/20">
            <p className="text-lg">Active</p>
            <p className="text-3xl font-bold">{upcoming.length}</p>
          </div>
        </motion.div>

        {/* ----------------- APPOINTMENT LISTS ----------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/10 rounded-2xl border border-white/20 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>

            {loading ? (
              <p>Loading...</p>
            ) : upcoming.length ? (
              <ul className="space-y-3">
                {upcoming.map((appt) => (
                  <li
                    key={appt.id}
                    className="p-4 rounded-xl bg-white/20 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{appt.doctor}</p>
                      <p className="text-gray-300 text-sm">{formatDate(appt.date_time)}</p>
                    </div>
                    <button
                      onClick={() => cancelAppointment(appt.id)}
                      className="mt-3 md:mt-0 px-4 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white"
                    >
                      Cancel
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300">No upcoming appointments.</p>
            )}
          </motion.div>

          {/* Past Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-white/10 rounded-2xl border border-white/20 shadow-lg"
          >
            <h3 className="text-xl font-semibold mb-4">Past Appointments</h3>

            {loading ? (
              <p>Loading...</p>
            ) : past.length ? (
              <ul className="space-y-3">
                {past.map((appt) => (
                  <li
                    key={appt.id}
                    className="p-4 rounded-xl bg-white/20 flex flex-col md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold">{appt.doctor}</p>
                      <p className="text-gray-300 text-sm">{formatDate(appt.date_time)}</p>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-green-600 text-sm">
                      Completed
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-300">No past appointments.</p>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
