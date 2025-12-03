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
      setAppointments(list.map((appt) => ({
        id: appt.id,
        doctor: appt.doctor?.name || "Unknown",
        date_time: appt.date_time,
        status: appt.status || "pending",
      })));
    } catch (err) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (id) => {
    try {
      await apiFetch(`/appointments/${id}/`, "DELETE", null, user.token);
      setAppointments((prev) => prev.filter((a) => a.id !== id));
      toast.success("Appointment cancelled successfully!", { duration: 3000 });
    } catch (err) {
      toast.error("Failed to cancel appointment.", { duration: 3000 });
    }
  };

  const markPaid = async (id) => {
    try {
      // Simulate API call to mark paid
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "paid" } : a))
      );
      toast.success("Appointment marked as Paid!", { duration: 3000 });
    } catch (err) {
      toast.error("Failed to update payment.", { duration: 3000 });
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

  return (
    <div className="min-h-screen px-4 md:px-12 py-12 text-white bg-transparent">
      <Toaster position="bottom-center" />

      {/* ---------- User Profile Card ---------- */}
      <motion.div
        className="max-w-md mx-auto bg-white/10 backdrop-blur-2xl border border-white/20 shadow-lg rounded-2xl p-8 mb-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl font-bold mb-3">{user.full_name}</h2>
        <p className="text-gray-300 mb-1">{user.email}</p>
        <p className="text-gray-300">
          Member Since: {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
        </p>
      </motion.div>

      {/* ---------- Appointments List ---------- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loading ? (
          <p className="text-center col-span-2">Loading appointments...</p>
        ) : appointments.length ? (
          appointments.map((appt) => (
            <motion.div
              key={appt.id}
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-5 flex flex-col justify-between transition-transform hover:scale-105 hover:shadow-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-xl font-semibold">{appt.doctor}</h4>
                  <p className="text-gray-300">{formatDate(appt.date_time)}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    appt.status === "paid"
                      ? "bg-green-500 text-white"
                      : appt.status === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                  }`}
                >
                  {appt.status.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-3 mt-2">
                {appt.status !== "paid" && (
                  <button
                    onClick={() => markPaid(appt.id)}
                    className="flex-1 py-2 bg-blue-500 hover:bg-blue-600 transition-colors rounded-xl text-white font-semibold"
                  >
                    Mark Paid
                  </button>
                )}
                <button
                  onClick={() => cancelAppointment(appt.id)}
                  className="flex-1 py-2 bg-red-500 hover:bg-red-600 transition-colors rounded-xl text-white font-semibold"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-gray-400 col-span-2">No appointments available.</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
