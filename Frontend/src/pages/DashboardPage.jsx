import React, { useState, useEffect, useMemo } from "react";
import { Toaster, toast } from "react-hot-toast";
import api from "../api/axios"; // your axios instance

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        // ✅ Use full backend paths
        const userRes = await api.get("/accounts/user/profile/");
        setUser(userRes.data);

        const apptRes = await api.get("/accounts/appointments/");
        const sortedAppts = apptRes.data.sort(
          (a, b) => new Date(b.date_time) - new Date(a.date_time)
        );
        setAppointments(sortedAppts);
      } catch (e) {
        console.error("Dashboard load failed:", e);
        toast.error("Failed to load dashboard data");
      }
    };

    loadDashboard();
  }, []);

  const cancelAppointment = async (id) => {
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
      { duration: 3000, position: "top-center", style: { borderRadius: "10px", background: "#fff" } }
    );

    try {
      await api.post(`/accounts/appointments/${id}/cancel/`);
    } catch (e) {
      console.error("Cancel API failed:", e);
      toast.error("Failed to cancel appointment on server");
    }
  };

  if (!user) return <div className="py-20 text-center text-lg">Loading…</div>;

  const completed = useMemo(() => appointments.filter(a => a.status === "Done").length, [appointments]);
  const cancelled = useMemo(() => appointments.filter(a => a.status === "Cancelled").length, [appointments]);

  return (
    <div className="min-h-screen bg-gray-100 px-8 py-10">
      <Toaster />
      <div className="flex gap-10">
        <div className="w-1/4"><ProfileCard user={user} /></div>
        <div className="w-3/4 space-y-10">
          <div className="flex gap-6">
            <SummaryCard title="All Bookings" value={appointments.length} percentage="100%" />
            <SummaryCard title="Completed" value={completed} percentage={`${((completed / Math.max(appointments.length,1))*100).toFixed(1)}%`} />
            <SummaryCard title="Cancelled" value={cancelled} percentage={`${((cancelled / Math.max(appointments.length,1))*100).toFixed(1)}%`} color="orange" />
          </div>
          <AppointmentsList appointments={appointments} cancelAppointment={cancelAppointment} />
        </div>
      </div>
    </div>
  );
}

// … Keep ProfileCard, InfoCard, SummaryCard, AppointmentsList as in your previous code
