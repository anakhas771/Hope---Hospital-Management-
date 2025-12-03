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

      const list = Array.isArray(data) ? data : data.appointments || [];

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
      const stillCancelled =
        appointments.find((a) => a.id === apptId)?.status === "cancelled-temp";
      if (stillCancelled) {
        try {
          await apiFetch(
            `/appointments/${apptId}/`,
            "DELETE",
            null,
            user.token
          );

          setAppointments((prev) => prev.filter((a) => a.id !== apptId));
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
      prev.map((a) => (a.id === apptId ? { ...a, status: "paid" } : a))
    );
    toast.dismiss(toastId);
    toast.success("Appointment restored.");
  };

  if (!user)
    return <p className="text-center mt-10 text-white">Loading user...</p>;

  const upcomingAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) >= new Date() && appt.status !== "cancelled-temp"
  );

  const pastAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) < new Date() && appt.status !== "cancelled-temp"
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
    <div className="pt-20 px-4 md:px-12 text-white space-y-10">
      <Toaster position="bottom-center" />

      {/* ---------------- HEADER ---------------- */}
      <div>
        <h1 className="text-3xl font-bold">Welcome, {user.full_name}</h1>
        <p className="text-white/60 mt-1">
          Here is your latest health activity.
        </p>
      </div>

      {/* ---------------- TOP GRID ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <motion.div
          className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl border border-white/20 shadow-xl flex flex-col"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-xl font-semibold mb-6">Your Profile</h3>

          <div className="space-y-3 text-white/90">
            <p>
              <span className="font-semibold text-white">Name:</span>{" "}
              {user.full_name}
            </p>
            <p>
              <span className="font-semibold text-white">Email:</span>{" "}
              {user.email}
            </p>
            <p>
              <span className="font-semibold text-white">Joined:</span>{" "}
              {user.date_joined
                ? new Date(user.date_joined).toLocaleDateString()
                : "N/A"}
            </p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="lg:col-span-2 grid grid-cols-2 gap-6">
          <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl flex flex-col justify-center">
            <h4 className="text-lg font-semibold mb-1 text-white/80">
              Upcoming Appointments
            </h4>
            <p className="text-4xl font-bold">{upcomingAppointments.length}</p>
          </motion.div>

          <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl flex flex-col justify-center">
            <h4 className="text-lg font-semibold mb-1 text-white/80">
              Past Appointments
            </h4>
            <p className="text-4xl font-bold">{pastAppointments.length}</p>
          </motion.div>
        </div>
      </div>

      {/* ---------------- APPOINTMENT SECTION ---------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
          <h3 className="text-2xl font-semibold mb-5">Upcoming Appointments</h3>

          {loading ? (
            <p className="text-white/70">Loading...</p>
          ) : upcomingAppointments.length ? (
            <ul className="space-y-4">
              {upcomingAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-white/20 rounded-xl p-4 flex justify-between items-center shadow-sm"
                >
                  <div className="text-white/90">
                    <p className="font-semibold">{appt.doctor}</p>
                    <p className="text-sm text-white/60">
                      {formatDate(appt.date_time)}
                    </p>
                  </div>

                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
                  >
                    Cancel
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/60 text-center">
              No upcoming appointments.
            </p>
          )}
        </motion.div>

        {/* Past Appointments */}
        <motion.div className="bg-white/10 p-6 rounded-2xl border border-white/20 shadow-xl">
          <h3 className="text-2xl font-semibold mb-5">Past Appointments</h3>

          {loading ? (
            <p className="text-white/70">Loading...</p>
          ) : pastAppointments.length ? (
            <ul className="space-y-4">
              {pastAppointments.map((appt) => (
                <li
                  key={appt.id}
                  className="bg-white/20 rounded-xl p-4 flex justify-between items-center shadow-sm"
                >
                  <div className="text-white/90">
                    <p className="font-semibold">{appt.doctor}</p>
                    <p className="text-sm text-white/60">
                      {formatDate(appt.date_time)}
                    </p>
                  </div>

                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-white/60 text-center">No past appointments.</p>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
