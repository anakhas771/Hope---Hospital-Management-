// src/pages/DashboardPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { motion } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { apiFetch } from "../lib/api";
import { ThemeContext } from "../context/ThemeContext";
import { Link } from "react-router-dom";

/**
 * Upgraded Dashboard:
 * - Tabs (Upcoming / Past) animated
 * - Profile card with dynamic name + joined date
 * - Upload profile image (saved in localStorage)
 * - Replaced Quick Actions with HealthStats
 * - Appointment details modal
 */

const DashboardPage = () => {
  const { theme, toggle } = useContext(ThemeContext);
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState(localStorage.getItem("profile_image") || null);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [selectedAppt, setSelectedAppt] = useState(null);

  /* ---------------- LOAD USER & APPOINTMENTS ---------------- */
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const access = localStorage.getItem("access");
    if (!storedUser || !access) return;

    try {
      const userData = JSON.parse(storedUser);
      // dynamic first_name/last_name/joined usage
      const finalUser = {
        ...userData,
        token: access,
        full_name: `${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
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
      setAppointments(
        list.map((appt) => ({
          id: appt.id,
          doctor: appt.doctor?.name || "Unknown",
          date_time: appt.date_time,
          status: appt.status || "pending",
          notes: appt.notes || "",
          location: appt.location || "",
        }))
      );
    } catch (err) {
      toast.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- PROFILE IMAGE ---------------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setProfileImage(reader.result);
      localStorage.setItem("profile_image", reader.result);
      toast.success("Profile image updated");
    };
    reader.readAsDataURL(file);
  };

  /* ---------------- APPOINTMENT ACTIONS ---------------- */
  const cancelAppointment = (id) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "cancelled-temp" } : a))
    );

    const toastId = toast.custom(
      (t) => (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className={`${
            t.visible ? "opacity-100" : "opacity-0"
          } bg-white/10 backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg border border-white/10 flex items-center gap-3`}
        >
          <div className="font-medium">Appointment removed</div>
          <button
            onClick={() => undoCancel(id, toastId)}
            className="px-2 py-1 bg-blue-500/80 hover:bg-blue-600 rounded-md text-sm"
          >
            Undo
          </button>
          <button
            onClick={() => toast.dismiss(toastId)}
            className="ml-2 text-red-300 hover:text-red-400 font-bold"
          >
            ✕
          </button>
        </motion.div>
      ),
      { position: "bottom-center", duration: 5000 }
    );

    setTimeout(async () => {
      const stillCancelled = appointments.find((a) => a.id === id)?.status === "cancelled-temp";
      if (stillCancelled) {
        try {
          await apiFetch(`/appointments/${id}/`, "DELETE", null, user.token);
          setAppointments((prev) => prev.filter((a) => a.id !== id));
          toast.success("Appointment cancelled");
        } catch (err) {
          toast.error("Cancellation failed");
        }
      }
    }, 5000);
  };

  const undoCancel = (id, toastId) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "pending" } : a)));
    toast.dismiss(toastId);
    toast.success("Appointment restored");
  };

  const markPaid = (id) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status: "paid" } : a)));
    toast.success("Marked as paid");
  };

  const openDetails = (appt) => setSelectedAppt(appt);
  const closeDetails = () => setSelectedAppt(null);

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
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

  const now = new Date();
  const upcomingAppointments = appointments.filter(
    (appt) => new Date(appt.date_time) >= now && appt.status !== "cancelled-temp"
  );
  const pastAppointments = appointments.filter(
    (appt) => new Date(appt.date_time) < now && appt.status !== "cancelled-temp"
  );

  return (
    <div className="min-h-screen px-4 md:px-12 pt-24 pb-12 text-white bg-transparent">
      <Toaster />

      <div className="flex flex-col md:flex-row gap-10">
        {/* PROFILE */}
        <motion.aside
          className="md:w-1/4 bg-white/8 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="relative">
            <img
              src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Profile"
              className="w-32 h-32 object-cover rounded-full border-4 border-white/20 shadow-lg"
            />
            <label className="absolute right-0 bottom-0 bg-blue-500 p-2 rounded-full cursor-pointer shadow-md">
              <input className="hidden" type="file" accept="image/*" onChange={handleImageUpload} />
              <span className="text-xs">📤</span>
            </label>
          </div>

          <h2 className="text-2xl font-bold mt-4">{user.full_name || `${user.first_name} ${user.last_name}`}</h2>

          <p className="text-sm text-gray-300 mt-1">{user.email}</p>

          <div className="mt-5 w-full space-y-2">
            <div className="flex justify-between text-sm text-gray-200">
              <span className="font-semibold">Joined</span>
              <span>
                {user.date_joined
                  ? new Date(user.date_joined).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "N/A"}
              </span>
            </div>

            <div className="flex justify-between text-sm text-gray-200">
              <span className="font-semibold">Appointments</span>
              <span>{appointments.length}</span>
            </div>

            <div className="flex justify-between text-sm text-gray-200">
              <span className="font-semibold">Account</span>
              <span className="text-green-300">Active ✔</span>
            </div>

            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => toggle()}
                className="w-full px-4 py-2 mt-3 bg-white/6 backdrop-blur rounded-xl font-semibold hover:bg-white/8"
              >
                Toggle {theme === "dark" ? "Light" : "Dark"} Mode
              </button>

              <Link
                to="/settings"
                className="w-full block text-center mt-3 text-sm text-gray-300 hover:text-white"
              >
                Open Settings
              </Link>
            </div>
          </div>
        </motion.aside>

        {/* RIGHT CONTENT */}
        <div className="flex-1 flex flex-col gap-8">
          {/* Top summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard title="Upcoming" value={upcomingAppointments.length} />
            <StatCard title="Past" value={pastAppointments.length} delay={0.05} />
            <HealthStats />
          </div>

          {/* Tabs */}
          <div>
            <Tabs active={activeTab} onChange={setActiveTab} tabs={[
              { key: "upcoming", label: `Upcoming (${upcomingAppointments.length})` },
              { key: "past", label: `Past (${pastAppointments.length})` },
            ]} />

            <div className="mt-6 grid grid-cols-1 gap-4">
              {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).length === 0 && (
                <div className="text-center text-gray-300 py-8 bg-white/6 rounded-2xl border border-white/8">
                  No {activeTab} appointments found.
                </div>
              )}

              {(activeTab === "upcoming" ? upcomingAppointments : pastAppointments).map((appt) => (
                <motion.div
                  key={appt.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-lg font-semibold">{appt.doctor}</h4>
                    <p className="text-sm text-gray-300">{formatDate(appt.date_time)}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{appt.notes || appt.location}</p>

                    <div className="mt-2">
                      <StatusBadge status={appt.status} />
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => openDetails(appt)}
                      className="px-3 py-1 rounded-xl bg-white/8 hover:bg-white/10"
                    >
                      Details
                    </button>

                    {appt.status !== "paid" && (
                      <button
                        onClick={() => markPaid(appt.id)}
                        className="px-3 py-1 bg-blue-500 hover:bg-blue-600 rounded-xl"
                      >
                        Paid
                      </button>
                    )}

                    <button
                      onClick={() => cancelAppointment(appt.id)}
                      className="px-3 py-1 bg-red-500 hover:bg-red-600 rounded-xl"
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

      {/* Appointment Details Modal */}
      {selectedAppt && (
        <AppointmentModal appt={selectedAppt} onClose={closeDetails} onMarkPaid={markPaid} onCancel={cancelAppointment} />
      )}
    </div>
  );
};

/* ----------------- Small Reusable UI ----------------- */

const StatCard = ({ title, value, delay = 0 }) => (
  <motion.div
    className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-5 text-center"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <div className="text-sm text-gray-300">{title}</div>
    <div className="text-3xl font-bold mt-2">{value}</div>
  </motion.div>
);

const HealthStats = () => (
  <motion.div
    className="bg-white/6 backdrop-blur-xl border border-white/8 rounded-2xl p-5"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Health Stats</h3>
        <p className="text-sm text-gray-300 mt-1">Quick glance of your wellness</p>
      </div>
      <div className="text-right">
        <div className="text-xl font-bold">72 bpm</div>
        <div className="text-xs text-gray-400">Resting HR</div>
      </div>
    </div>

    <div className="mt-3 grid grid-cols-3 gap-2">
      <MiniStat label="Sleep" value="7h" />
      <MiniStat label="Water" value="1.8L" />
      <MiniStat label="Steps" value="4.2k" />
    </div>
  </motion.div>
);

const MiniStat = ({ label, value }) => (
  <div className="bg-white/4 rounded-xl p-2 text-center">
    <div className="text-sm text-gray-300">{label}</div>
    <div className="font-semibold">{value}</div>
  </div>
);

const Tabs = ({ tabs = [], active, onChange }) => (
  <div className="flex gap-2 bg-white/6 p-1 rounded-xl w-max">
    {tabs.map((t) => {
      const isActive = active === t.key;
      return (
        <button
          key={t.key}
          onClick={() => onChange(t.key)}
          className={`px-4 py-2 rounded-lg transition-all font-semibold ${isActive ? "bg-blue-500 text-white" : "text-gray-300"}`}
        >
          {t.label}
        </button>
      );
    })}
  </div>
);

const StatusBadge = ({ status }) => {
  const map = {
    paid: { txt: "PAID", cls: "bg-green-500/20 text-green-300" },
    pending: { txt: "PENDING", cls: "bg-yellow-500/20 text-yellow-200" },
    cancelled: { txt: "CANCELLED", cls: "bg-red-500/20 text-red-300" },
    "cancelled-temp": { txt: "CANCELLED", cls: "bg-red-500/20 text-red-300" },
  };
  const s = map[status] || { txt: status?.toUpperCase?.() || "UNKNOWN", cls: "bg-white/6 text-white" };
  return <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${s.cls}`}>{s.txt}</span>;
};

/* ---------------- Appointment Details Modal ---------------- */
const AppointmentModal = ({ appt, onClose, onMarkPaid, onCancel }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative bg-white/6 backdrop-blur-xl border border-white/10 rounded-2xl p-6 w-11/12 md:w-2/5 shadow-2xl text-white"
      >
        <h3 className="text-xl font-bold">{appt.doctor}</h3>
        <p className="text-sm text-gray-300 mt-1">{formatDate(appt.date_time)}</p>

        <div className="mt-4 text-gray-300">
          <p><span className="font-semibold">Location: </span>{appt.location || "—"}</p>
          <p className="mt-2"><span className="font-semibold">Notes: </span>{appt.notes || "No notes provided"}</p>
        </div>

        <div className="flex gap-2 justify-end mt-6">
          {appt.status !== "paid" && (
            <button onClick={() => { onMarkPaid(appt.id); onClose(); }} className="px-4 py-2 rounded-xl bg-green-500 hover:bg-green-600">Mark Paid</button>
          )}

          <button onClick={() => { onCancel(appt.id); onClose(); }} className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600">Cancel</button>

          <button onClick={onClose} className="px-4 py-2 rounded-xl bg-white/6">Close</button>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
