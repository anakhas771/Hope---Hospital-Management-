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
  const [profileImage, setProfileImage] = useState(
    localStorage.getItem("profile_image") || null
  );

  /* ---------------- LOAD USER & APPOINTMENTS ---------------- */
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
          `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
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

  /* ---------------- HANDLE PROFILE IMAGE UPLOAD ---------------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profile_image", reader.result);
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- CANCEL APPOINTMENT ---------------- */
  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled-temp" } : a))
    );

    const toastId = toast.custom(
      (t) => (
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className={`${
            t.visible ? "opacity-100" : "opacity-0"
          } bg-white/20 backdrop-blur-xl text-white px-5 py-4 rounded-xl shadow-xl border border-white/20 flex items-center gap-3`}
        >
          <p className="font-medium">Appointment removed</p>

          <button
            onClick={() => undoCancel(id, toastId)}
            className="px-3 py-1 bg-blue-500/80 hover:bg-blue-600 rounded-lg text-sm"
          >
            Undo
          </button>

          <button
            onClick={() => toast.dismiss(toastId)}
            className="text-red-300 hover:text-red-400 font-bold ml-2"
          >
            ✕
          </button>
        </motion.div>
      ),
      { position: "bottom-center", duration: 5000 }
    );

    setTimeout(async () => {
      const stillCancelled =
        appointments.find((a) => a.id === id)?.status === "cancelled-temp";

      if (stillCancelled) {
        try {
          await apiFetch(`/appointments/${id}/`, "DELETE", null, user.token);
          setAppointments((prev) => prev.filter((a) => a.id !== id));

          toast.success("✔ Appointment cancelled!", {
            position: "bottom-center",
          });
        } catch (err) {
          toast.error("Cancellation failed!", {
            position: "bottom-center",
          });
        }
      }
    }, 5000);
  };

  const undoCancel = (id, toastId) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "pending" } : a))
    );
    toast.dismiss(toastId);

    toast.success("✨ Appointment restored!", {
      position: "bottom-center",
    });
  };

  const markPaid = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "paid" } : a))
    );
    toast.success("💳 Marked as Paid!", { position: "bottom-center" });
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

  if (!user)
    return <p className="text-center mt-10 text-white">Loading...</p>;

  const upcomingAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) >= new Date() && appt.status !== "cancelled-temp"
  );

  const pastAppointments = appointments.filter(
    (appt) =>
      new Date(appt.date_time) < new Date() && appt.status !== "cancelled-temp"
  );

  /* ---------------- UI STARTS ---------------- */
  return (
    <div className="min-h-screen px-4 md:px-12 pt-24 pb-12 text-white bg-transparent">
      <Toaster />

      <div className="flex flex-col md:flex-row gap-10">

        {/* ---------------- LEFT PROFILE CARD ---------------- */}
        <motion.div
          className="md:w-1/4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 shadow-2xl flex flex-col items-center text-center"
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Profile Image */}
          <div className="relative">
            <img
              src={
                profileImage ||
                "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="Profile"
              className="w-32 h-32 rounded-full object-cover shadow-xl border-4 border-white/30"
            />

            {/* Upload Button */}
            <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 p-2 rounded-full cursor-pointer shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              <span className="text-xs">📤</span>
            </label>
          </div>

          <h2 className="text-3xl font-bold mt-4">{user.full_name}</h2>

          <div className="space-y-3 text-gray-200 mt-4 w-full">
            <InfoRow label="Email" value={user.email} />
            <InfoRow
              label="Joined"
              value={
                user.date_joined
                  ? new Date(user.date_joined).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })
                  : "N/A"
              }
            />
            <InfoRow label="Appointments" value={appointments.length} />
            <InfoRow label="Status" value="Active ✔" color="text-green-400" />
          </div>
        </motion.div>

        {/* ---------------- RIGHT CONTENT ---------------- */}
        <div className="flex-1 flex flex-col gap-8">

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card title="Upcoming" value={upcomingAppointments.length} />
            <Card title="Past" value={pastAppointments.length} delay={0.1} />
            <Card
              title="Recent Activity"
              value={Math.floor(Math.random() * 20) + 5}
              delay={0.2}
            />
          </div>

          {/* Action cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <SmallCard />
            <TipsCard />
          </div>

          {/* Appointment list */}
          <div className="grid grid-cols-1 gap-6">
            {appointments.map((appt) => (
              <motion.div
                key={appt.id}
                className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-5 flex justify-between items-center hover:scale-[1.02] transition-all"
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div>
                  <h4 className="text-lg font-semibold">{appt.doctor}</h4>
                  <p className="text-gray-300">{formatDate(appt.date_time)}</p>

                  {/* Status Badge */}
                  <span
                    className={`mt-2 inline-block px-3 py-1 rounded-full text-xs font-semibold 
                      ${
                        appt.status === "paid"
                          ? "bg-green-500/30 text-green-300"
                          : appt.status === "pending"
                          ? "bg-yellow-500/30 text-yellow-200"
                          : "bg-red-500/30 text-red-300"
                      }`}
                  >
                    {appt.status.toUpperCase()}
                  </span>
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

/* ---------- Small Reusable Components ---------- */
const InfoRow = ({ label, value, color = "text-gray-200" }) => (
  <p className="flex justify-between text-sm">
    <span className="font-semibold">{label}:</span>
    <span className={color}>{value}</span>
  </p>
);

const Card = ({ title, value, delay = 0 }) => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-3xl p-6 text-center hover:scale-105 transition-all"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <p className="text-gray-300">{title}</p>
    <p className="text-4xl font-bold">{value}</p>
  </motion.div>
);

const SmallCard = () => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-3xl p-6 hover:scale-105 transition-all"
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
);

const TipsCard = () => (
  <motion.div
    className="bg-white/10 backdrop-blur-xl border border-white/20 shadow-lg rounded-3xl p-6 hover:scale-105 transition-all"
    initial={{ opacity: 0, y: 25 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.1 }}
  >
    <h3 className="text-lg font-semibold mb-3">Health Tip</h3>
    <p className="text-gray-300">
      Drink 2–3 liters of water daily to stay hydrated.
    </p>
  </motion.div>
);

export default DashboardPage;
