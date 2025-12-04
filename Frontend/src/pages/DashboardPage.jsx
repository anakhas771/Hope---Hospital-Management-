// ---------------------------------------
// DashboardPage.jsx
// ---------------------------------------
import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import api from "../api/axios";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // ---------------- LOAD USER + APPOINTMENTS ----------------
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [userRes, apptRes] = await Promise.all([
          api.get("/users/profile/"),
          api.get("/appointments/"),
        ]);

        setUser(userRes.data);
        setAppointments(
          apptRes.data.sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
        );
      } catch (err) {
        console.error("Dashboard load failed:", err);
        toast.error("Failed to load dashboard data");
      }
    };

    loadDashboard();
  }, []);

  // ---------------- CANCEL APPOINTMENT WITH UNDO ----------------
  const cancelAppointment = async (id) => {
    const deleted = appointments.find((a) => a.id === id);
    setAppointments((prev) => prev.filter((a) => a.id !== id));

    toast(
      (t) => (
        <div className="text-center">
          <p className="font-semibold text-gray-900">Appointment cancelled</p>
          <button
            className="text-blue-600 underline text-sm mt-1"
            onClick={() => {
              setAppointments((prev) =>
                [...prev, deleted].sort((a, b) => new Date(b.date_time) - new Date(a.date_time))
              );
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      { duration: 3000, position: "top-center", style: { borderRadius: "10px", background: "#fff" } }
    );

    try {
      await api.post(`/appointments/${id}/cancel/`);
    } catch (err) {
      console.error("Cancel API failed:", err);
      toast.error("Failed to cancel appointment on server");
    }
  };

  // ---------------- SUMMARY DATA ----------------
  const summary = useMemo(() => {
    const completed = appointments.filter((a) => a.status === "Done").length;
    const cancelled = appointments.filter((a) => a.status === "Cancelled").length;
    return { completed, cancelled };
  }, [appointments]);

  if (!user) return <div className="py-20 text-center text-lg">Loading…</div>;

  return (
    <div className="min-h-screen bg-gray-100 px-8 py-10">
      <Toaster />
      <div className="flex gap-10">
        {/* LEFT PROFILE */}
        <div className="w-1/4">
          <ProfileCard user={user} />
        </div>

        {/* RIGHT DASHBOARD */}
        <div className="w-3/4 space-y-10">
          <div className="flex gap-6">
            <SummaryCard title="All Bookings" value={appointments.length} percentage="100%" />
            <SummaryCard
              title="Completed"
              value={summary.completed}
              percentage={`${((summary.completed / Math.max(appointments.length, 1)) * 100).toFixed(1)}%`}
            />
            <SummaryCard
              title="Cancelled"
              value={summary.cancelled}
              percentage={`${((summary.cancelled / Math.max(appointments.length, 1)) * 100).toFixed(1)}%`}
              color="orange"
            />
          </div>

          <AppointmentsList appointments={appointments} cancelAppointment={cancelAppointment} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- PROFILE CARD ------------------------------ */
const ProfileCard = ({ user }) => (
  <div className="bg-white/50 backdrop-blur-xl shadow-xl rounded-3xl p-6 flex flex-col items-center">
    <img
      src={user.profile_image || "/default-avatar.png"}
      alt="Profile"
      className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
    />
    <h2 className="mt-4 text-xl font-bold">{user.first_name} {user.last_name}</h2>
    <span className="mt-1 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">Active User</span>
    <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">Add New Appointment</button>
    <div className="mt-6 w-full space-y-3">
      <InfoCard label="Email" value={user.email} />
      <InfoCard label="Joined" value={new Date(user.date_joined).toDateString()} />
    </div>
  </div>
);

const InfoCard = ({ label, value }) => (
  <div className="bg-white/70 backdrop-blur p-3 rounded-xl">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm font-medium">{value}</p>
  </div>
);

/* -------------------------------- SUMMARY CARDS ------------------------------ */
const SummaryCard = ({ title, value, percentage, color = "blue" }) => {
  const colorMap = { blue: "text-blue-500", orange: "text-orange-500", green: "text-green-500", red: "text-red-500" };
  return (
    <div className="bg-white/40 backdrop-blur-xl w-1/3 p-6 rounded-3xl shadow-md">
      <p className="text-gray-600">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      <p className={`${colorMap[color] || colorMap.blue} font-medium mt-1`}>{percentage}</p>
    </div>
  );
};

/* -------------------------------- APPOINTMENTS LIST ------------------------------ */
const AppointmentsList = ({ appointments, cancelAppointment }) => (
  <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg">
    <h2 className="text-xl font-semibold mb-4">Appointments</h2>

    {appointments.length === 0 ? (
      <p className="text-center text-gray-600 py-6">No appointments yet.</p>
    ) : (
      <div className="space-y-4">
        {appointments.map((a) => (
          <div
            key={a.id}
            className="flex justify-between items-center bg-white/70 p-4 rounded-xl shadow hover:scale-[1.01] transition-all"
          >
            <p className="font-bold text-gray-700">{new Date(a.date_time).toDateString()}</p>
            <div className="w-1/3">
              <p className="font-semibold">{a.doctor?.name || "Unknown Doctor"}</p>
              <p className="text-xs text-gray-500">{a.notes || "No notes"}</p>
              {a.doctor?.specialization && <p className="text-xs text-gray-400">{a.doctor.specialization}</p>}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                a.status === "Done"
                  ? "bg-green-100 text-green-600"
                  : a.status === "Cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {a.status}
            </span>
            <p className="font-semibold">₹{a.amount}</p>
            <div className="flex gap-2">
              <button
                onClick={() => cancelAppointment(a.id)}
                disabled={a.status === "Cancelled"}
                className={`px-3 py-1 rounded-xl text-sm ${
                  a.status === "Cancelled" ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Cancel
              </button>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">Pay</button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);
