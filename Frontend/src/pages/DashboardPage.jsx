// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "../lib/api";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // -------------------- Load User --------------------
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access");

    if (!storedUser || !access) {
      return navigate("/login");
    }

    try {
      const userData = JSON.parse(storedUser);

      // Attach token into user object
      const finalUser = {
        ...userData,
        token: access, // FIXED ✔
        full_name:
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim() ||
          userData.name ||
          userData.full_name ||
          "",
      };

      setUser(finalUser);

      fetchAppointments(access, userData.id);
    } catch (err) {
      navigate("/login");
    }
  }, [navigate]);

  // -------------------- Fetch Appointments --------------------
  const fetchAppointments = async (token, userId) => {
    try {
      setLoading(true);

      // FIXED ✔ PROPER apiFetch usage
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
        payment_status: appt.payment_status || "",
        notes: appt.notes || "",
        created_at: appt.created_at,
      }));

      setAppointments(mapped);
    } catch (err) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("user");
      localStorage.removeItem("access");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  // -------------------- Cancel Appointment --------------------
  const cancelAppointment = (apptId) => {
    const appt = appointments.find((a) => a.id === apptId);
    if (!appt) return;

    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId ? { ...a, status: "cancelled-temp" } : a
      )
    );

    const toastId = toast(
      <>
        Appointment removed.{" "}
        <button
          className="underline ml-2"
          onClick={() => undoCancel(apptId, toastId)}
        >
          Undo
        </button>
      </>,
      { duration: 5000 }
    );

    setTimeout(async () => {
      const stillCancelled = appointments.find((a) => a.id === apptId)?.status === "cancelled-temp";
      if (stillCancelled) {
        try {
          await apiFetch(
            `/appointments/${apptId}/`,
            "DELETE",
            null,
            user.token
          );

          setAppointments((prev) =>
            prev.filter((a) => a.id !== apptId)
          );
          toast.dismiss(toastId);
          toast.success("Appointment cancelled.");
        } catch (err) {
          toast.error("Failed to cancel. Try again.");
        }
      }
    }, 5000);
  };

  const undoCancel = (apptId, toastId) => {
    setAppointments((prev) =>
      prev.map((a) =>
        a.id === apptId ? { ...a, status: "paid" } : a
      )
    );
    toast.dismiss(toastId);
    toast.success("Appointment restored.");
  };

  if (!user)
    return <p className="text-center mt-10 text-white">Loading user...</p>;

  const upcomingAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) >= new Date() &&
      appt.status !== "cancelled-temp"
  );

  const pastAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) < new Date() &&
      appt.status !== "cancelled-temp"
  );

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


  return (
    <div className="flex flex-col gap-8 pt-16 px-4 md:px-12 text-white">
      <Toaster position="bottom-center" />

      {/* -------------- Profile + Stats ---------------- */}
      <motion.div
        className="flex flex-col md:flex-row gap-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full md:w-1/4 border border-white/20 shadow-lg">
          <h3 className="text-xl font-semibold mb-6">Profile</h3>
          <div className="space-y-3">
            <p><span className="font-semibold">Name:</span> {user.full_name}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p>
              <span className="font-semibold">Member Since:</span>{" "}
              {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-6">
          <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
            <h4 className="font-semibold mb-2">Upcoming Appointments</h4>
            <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
          </motion.div>

          <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg">
            <h4 className="font-semibold mb-2">Past Appointments</h4>
            <p className="text-3xl font-bold">{pastAppointments.length}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* ------------------ Appointment Lists ------------------ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Upcoming */}
        <motion.div
          className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
          {loading ? (
            <p>Loading...</p>
          ) : upcomingAppointments.length ? (
            <ul className="space-y-2">
              {upcomingAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="p-3 rounded-lg bg-white/20 flex justify-between items-center"
                >
                  <span>
                    {formatDate(appt.date_time)} - {appt.doctor} ({appt.status})
                  </span>
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm"
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-300">No upcoming appointments.</p>
          )}
        </motion.div>

        {/* Past */}
        <motion.div
          className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-lg"
        >
          <h3 className="text-xl font-semibold mb-4">Past Appointments</h3>
          {loading ? (
            <p>Loading...</p>
          ) : pastAppointments.length ? (
            <ul className="space-y-2">
              {pastAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="p-3 rounded-lg bg-white/20 flex justify-between items-center"
                >
                  <span>
                    {formatDate(appt.date_time)} - {appt.doctor} ({appt.status})
                  </span>
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm"
                  >
                    Delete
                  </button>
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
