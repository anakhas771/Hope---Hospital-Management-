// ---------------------------------------
// DashboardPage.jsx (FULL FIXED VERSION)
// ---------------------------------------
import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import { apiFetch } from "../lib/api";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // ---------------- LOAD USER + APPOINTMENTS ----------------
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // Fetch user profile
        const userData = await apiFetch("/user/profile/");
        setUser(userData);

        // Fetch appointments 
        const apptData = await apiFetch("/appointments/");

        const cleaned = Array.isArray(apptData) ? apptData : [];

        const sorted = cleaned.sort(
          (a, b) => new Date(b.date_time) - new Date(a.date_time)
        );

        setAppointments(sorted);

      } catch (e) {
        console.error("Dashboard load failed:", e);
        toast.error("Failed to load dashboard data");

        // IMPORTANT FIX — avoid React crash
        setAppointments([]);
      }
    };

    loadDashboard();
  }, []);

  // ---------------- CANCEL APPOINTMENT + UNDO ----------------
  const cancelAppointment = async (id) => {
    if (!Array.isArray(appointments)) return;

    const deleted = appointments.find((a) => a.id === id);
    const updated = appointments.filter((a) => a.id !== id);

    setAppointments(updated);

    toast(
      (t) => (
        <div className="text-center">
          <p className="font-semibold text-gray-900">Appointment cancelled</p>
          <button
            className="text-blue-600 underline text-sm mt-1"
            onClick={() => {
              setAppointments((prev) =>
                [...prev, deleted].sort(
                  (a, b) => new Date(b.date_time) - new Date(a.date_time)
                )
              );
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      {
        duration: 3000,
        position: "top-center",
        style: { borderRadius: "10px", background: "#fff" },
      }
    );

    try {
      await apiFetch(`/appointments/${id}/cancel/`, "POST");
    } catch (e) {
      console.error("Cancel API failed:", e);
      toast.error("Failed to cancel appointment");
    }
  };

  if (!user)
    return <div className="py-20 text-center text-lg">Loading…</div>;

  // ---------------- SUMMARY DATA ----------------
  const completed = useMemo(() => {
    if (!Array.isArray(appointments)) return 0;
    return appointments.filter((a) => a.status === "Done").length;
  }, [appointments]);

  const cancelled = useMemo(() => {
    if (!Array.isArray(appointments)) return 0;
    return appointments.filter((a) => a.status === "Cancelled").length;
  }, [appointments]);

  return (
    <div className="min-h-screen bg-gray-100 px-8 py-10">
      <Toaster />

      <div className="flex gap-10">
        {/* LEFT PROFILE */}
        <div className="w-1/4">
          <ProfileCard user={user} />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-3/4 space-y-10">
          {/* SUMMARY */}
          <div className="flex gap-6">
            <SummaryCard
              title="All Bookings"
              value={Array.isArray(appointments) ? appointments.length : 0}
              percentage="100%"
            />
            <SummaryCard
              title="Completed"
              value={completed}
              percentage={`${(
                (completed / Math.max((appointments || []).length, 1)) *
                100
              ).toFixed(1)}%`}
            />
            <SummaryCard
              title="Cancelled"
              value={cancelled}
              percentage={`${(
                (cancelled / Math.max((appointments || []).length, 1)) *
                100
              ).toFixed(1)}%`}
              color="orange"
            />
          </div>

          {/* APPOINTMENTS */}
          <AppointmentsList
            appointments={appointments}
            cancelAppointment={cancelAppointment}
          />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------- PROFILE CARD ------------------------------ */
function ProfileCard({ user }) {
  return (
    <div className="bg-white/50 backdrop-blur-xl shadow-xl rounded-3xl p-6">
      <div className="flex flex-col items-center">
        <img
          src={user.profile_image || "/default-avatar.png"}
          className="w-28 h-28 rounded-full border-4 border-white shadow-xl object-cover"
          alt="Profile"
        />

        <h2 className="mt-4 text-xl font-bold">
          {user.first_name} {user.last_name}
        </h2>

        <span className="mt-1 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
          Active User
        </span>

        <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl">
          Add New Appointment
        </button>

        <div className="mt-6 w-full space-y-3">
          <InfoCard label="Email" value={user.email} />
          <InfoCard
            label="Joined"
            value={new Date(user.date_joined).toDateString()}
          />
        </div>
      </div>
    </div>
  );
}

/* Profile Info Card */
function InfoCard({ label, value }) {
  return (
    <div className="bg-white/70 backdrop-blur p-3 rounded-xl">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

/* -------------------------------- SUMMARY CARD ------------------------------ */
function SummaryCard({ title, value, percentage, color = "blue" }) {
  const colorMap = {
    blue: "text-blue-500",
    orange: "text-orange-500",
    green: "text-green-500",
    red: "text-red-500",
  };

  return (
    <div className="bg-white/40 backdrop-blur-xl w-1/3 p-6 rounded-3xl shadow-md">
      <p className="text-gray-600">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      <p className={`${colorMap[color]} font-medium mt-1`}>{percentage}</p>
    </div>
  );
}

/* -------------------------------- APPOINTMENTS LIST ------------------------------ */
function AppointmentsList({ appointments, cancelAppointment }) {
  const safeList = Array.isArray(appointments) ? appointments : [];

  return (
    <div className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-lg">
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>

      {safeList.length === 0 && (
        <p className="text-center text-gray-600 py-6">No appointments yet.</p>
      )}

      <div className="space-y-4">
        {safeList.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white/70 p-4 rounded-xl shadow hover:scale-[1.01] transition-all"
          >
            <p className="font-bold text-gray-700">
              {new Date(item.date_time).toDateString()}
            </p>

            {/* Doctor Info */}
            <div className="w-1/3">
              <p className="font-semibold">
                {item.doctor?.name || "Unknown Doctor"}
              </p>
              <p className="text-xs text-gray-500">{item.notes || "No notes"}</p>
              {item.doctor?.specialization && (
                <p className="text-xs text-gray-400">
                  {item.doctor.specialization}
                </p>
              )}
            </div>

            {/* Status */}
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                item.status === "Done"
                  ? "bg-green-100 text-green-600"
                  : item.status === "Cancelled"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              {item.status}
            </span>

            {/* Amount */}
            <p className="font-semibold">₹{item.amount}</p>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => cancelAppointment(item.id)}
                disabled={item.status === "Cancelled"}
                className={`px-3 py-1 rounded-xl text-sm ${
                  item.status === "Cancelled"
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                Cancel
              </button>

              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">
                Pay
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
