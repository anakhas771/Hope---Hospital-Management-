// src/pages/DashboardPage.jsx
import React, { useEffect, useState } from "react";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";

const DashboardPage = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    try {
      const userData = JSON.parse(storedUser);
      if (!userData.token) return navigate("/login");

      const fullName = `${userData.first_name || ""} ${userData.last_name || ""}`.trim();
      setUser({ ...userData, full_name: fullName });

      fetchAppointments(userData.token, userData.id);
    } catch (err) {
      console.error("Error parsing user:", err);
      navigate("/login");
    }
  }, [navigate]);

  const fetchAppointments = async (token, userId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `http://127.0.0.1:8000/accounts/appointments/?user=${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      let data = Array.isArray(res.data) ? res.data : res.data.appointments || [];

      const mapped = data.map((appt) => ({
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
      console.error("Error fetching appointments:", err);
      toast.error("Session expired or failed to fetch appointments. Please login again.", { position: "bottom-center" });
      localStorage.removeItem("user");
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = (apptId) => {
    const appt = appointments.find((a) => a.id === apptId);
    if (!appt) return;

    // Temporarily mark as cancelled
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
      { duration: 5000, position: "bottom-center" }
    );

    setTimeout(async () => {
      const stillCancelled = appointments.find((a) => a.id === apptId)?.status === "cancelled-temp";
      if (stillCancelled) {
        try {
          await axios.delete(
            `http://127.0.0.1:8000/accounts/appointments/${apptId}/`,
            { headers: { Authorization: `Bearer ${user.token}` } }
          );
          setAppointments((prev) => prev.filter((a) => a.id !== apptId));
          toast.dismiss(toastId);
          toast.success("Appointment cancelled.", { position: "bottom-center" });
        } catch (err) {
          console.error("Failed to cancel:", err);
          toast.error("Failed to cancel. Try again.", { position: "bottom-center" });
          setAppointments((prev) =>
            prev.map((a) =>
              a.id === apptId ? { ...a, status: appt.status } : a
            )
          );
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
    toast.success("Appointment restored.", { position: "bottom-center" });
  };

  if (!user) return <p className="text-center mt-10 text-white">Loading user...</p>;

  const upcomingAppointments = appointments.filter((appt) => new Date(appt.date_time) >= new Date() && appt.status !== "cancelled-temp");
  const pastAppointments = appointments.filter((appt) => new Date(appt.date_time) < new Date() && appt.status !== "cancelled-temp");

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
      <Toaster position="bottom-center" reverseOrder={false} />

      {/* Profile + Stats */}
      <motion.div className="flex flex-col md:flex-row gap-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl w-full md:w-1/4 border border-white/20 shadow-lg">
          <h3 className="text-xl font-semibold mb-6">Profile</h3>
          <div className="space-y-3">
            <p><span className="font-semibold">Name:</span> {user.full_name}</p>
            <p><span className="font-semibold">Email:</span> {user.email}</p>
            <p><span className="font-semibold">Member Since:</span> {user.date_joined ? new Date(user.date_joined).toLocaleDateString() : "N/A"}</p>
          </div>
        </div>

        <div className="flex-1 grid grid-cols-1 gap-6">
          <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg">
            <h4 className="font-semibold mb-2">Upcoming Appointments</h4>
            <p className="text-3xl font-bold">{upcomingAppointments.length}</p>
          </motion.div>
          <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg">
            <h4 className="font-semibold mb-2">Past Appointments</h4>
            <p className="text-3xl font-bold">{pastAppointments.length}</p>
          </motion.div>
        </div>
      </motion.div>

      {/* Appointment Lists */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Upcoming */}
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-xl font-semibold mb-4">Upcoming Appointments</h3>
          {loading ? (
            <p>Loading...</p>
          ) : upcomingAppointments.length ? (
            <ul className="space-y-2">
              {upcomingAppointments.map((appt) => (
                <li key={appt.id} className="p-3 rounded-lg bg-white/20 flex justify-between items-center hover:scale-[1.01] transition">
                  <span>
                    {formatDate(appt.date_time)} - {appt.doctor} ({appt.status}) ₹{appt.amount} {appt.payment_status && `(${appt.payment_status})`}
                  </span>
                  <button onClick={() => cancelAppointment(appt.id)} className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm transition">Cancel</button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-300">No upcoming appointments.</p>
          )}
        </motion.div>

        {/* Past */}
        <motion.div className="bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20 shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h3 className="text-xl font-semibold mb-4">Past Appointments</h3>
          {loading ? (
            <p>Loading...</p>
          ) : pastAppointments.length ? (
            <ul className="space-y-2">
              {pastAppointments.map((appt) => (
                <li key={appt.id} className="p-3 rounded-lg bg-white/20 flex justify-between items-center hover:scale-[1.01] transition">
                  <span>
                    {formatDate(appt.date_time)} - {appt.doctor} ({appt.status}) ₹{appt.amount} {appt.payment_status && `(${appt.payment_status})`}
                  </span>
                  <button onClick={() => cancelAppointment(appt.id)} className="px-3 py-1 rounded-full bg-red-500 hover:bg-red-600 text-white text-sm transition">Delete</button>
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