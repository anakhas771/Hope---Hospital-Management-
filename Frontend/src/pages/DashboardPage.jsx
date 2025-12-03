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
      const data = await apiFetch(
        `/appointments/?user=${userId}`,
        "GET",
        null,
        token
      );
      const list = Array.isArray(data) ? data : data.appointments || [];
      setAppointments(
        list.map((appt) => ({
          id: appt.id,
          doctor: appt.doctor?.name || "Unknown",
          date_time: appt.date_time,
          status: appt.status || "pending",
        }))
      );
    } catch (err) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled-temp" } : a))
    );

    const toastId = toast(
      ({ close }) => (
        <div className="flex items-center gap-2">
          <span>Appointment removed.</span>
          <button
            onClick={() => undoCancel(id, toastId)}
            className="underline font-semibold"
          >
            Undo
          </button>
        </div>
      ),
      { position: "top-center", duration: 5000 }
    );

    setTimeout(async () => {
      const stillCancelled =
        appointments.find((a) => a.id === id)?.status === "cancelled-temp";
      if (stillCancelled) {
        try {
          await apiFetch(`/appointments/${id}/`, "DELETE", null, user.token);
          setAppointments((prev) => prev.filter((a) => a.id !== id));
          toast.dismiss(toastId);
          toast.success("Appointment cancelled successfully!", {
            duration: 3000,
          });
        } catch (err) {
          toast.error("Failed to cancel appointment.", { duration: 3000 });
        }
      }
    }, 5000);
  };

  const undoCancel = (id, toastId) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "pending" } : a))
    );
    toast.dismiss(toastId);
    toast.success("Appointment restored!", { duration: 3000 });
  };

  const markPaid = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "paid" } : a))
    );
    toast.success("Appointment marked as Paid!", { duration: 3000 });
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

  const upcomingAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) >= new Date() && appt.status !== "cancelled-temp"
  );
  const pastAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) < new Date() && appt.status !== "cancelled-temp"
  );

  return (
    <div className="min-h-screen px-4 md:px-12 pt-24 pb-12 text-white bg-transparent">
      <Toaster />

      <div className="flex flex-col md:flex-row gap-10">
        {/* ---------------- LEFT: PROFILE CARD ---------------- */}
        <motion.div
          className="md:w-1/4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-8 shadow-xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold mb-6">{user.full_name}</h2>

          <div className="space-y-3 text-gray-200">
            <p>
              <span className="font-semibold">Email:</span> {user.email}
            </p>
            <p>
              <span className="font-semibold">Joined:</span>{" "}
              {user.date_joined
                ? new Date(user.date_joined).toLocaleDateString()
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold">Appointments:</span>{" "}
              {appointments.length}
            </p>
          </div>
        </motion.div>

        {/* ---------------- RIGHT: DASHBOARD CONTENT ---------------- */}
        <div className="flex-1 flex flex-col gap-8">
          {/* --------- DASHBOARD CARDS (3-CARD GRID) --------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Upcoming */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <p className="text-gray-300">Upcoming</p>
              <p className="text-3xl font-bold">
                {upcomingAppointments.length}
              </p>
            </motion.div>

            {/* Past */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <p className="text-gray-300">Past</p>
              <p className="text-3xl font-bold">{pastAppointments.length}</p>
            </motion.div>

            {/* New Card – Activity */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 text-center hover:scale-105 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-gray-300">Recent Activity</p>
              <p className="text-3xl font-bold">
                {Math.floor(Math.random() * 20) + 5}
              </p>
            </motion.div>
          </div>

          {/* -------- SMALLER ADDITIONAL CARDS BELOW -------- */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 hover:scale-105 transition-all"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
              <div className="flex gap-3">
                <button className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600 rounded-xl font-semibold">
                  Book
                </button>
                <button className="px-3 py-1 bg-green-500/80 hover:bg-green-600 rounded-xl font-semibold">
                  Report
                </button>
                <button className="px-3 py-1 bg-purple-500/80 hover:bg-purple-600 rounded-xl font-semibold">
                  History
                </button>
              </div>
            </motion.div>

            {/* Health Tips */}
            <motion.div
              className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 hover:scale-105 transition-all"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h3 className="text-lg font-semibold mb-3">Health Tip</h3>
              <p className="text-gray-300">
                Drink at least 2–3 liters of water daily to stay hydrated.
              </p>
            </motion.div>
          </div>

          {/* ----------- APPOINTMENTS LIST ----------- */}
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appt) => (
              <motion.div
                key={appt.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-5 flex justify-between items-center hover:scale-[1.02] transition-all"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h4 className="text-lg font-semibold">{appt.doctor}</h4>
                  <p className="text-gray-300">{formatDate(appt.date_time)}</p>
                </div>

                <div className="flex gap-2">
                  {appt.status !== "paid" && (
                    <button
                      onClick={() => markPaid(appt.id)}
                      className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-xl font-semibold"
                    >
                      Paid
                    </button>
                  )}

                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-xl font-semibold"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
