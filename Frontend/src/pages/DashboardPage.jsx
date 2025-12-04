import React, { useState, useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";

export default function DashboardPage() {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  // ------------------------------
  // FETCH USER + APPOINTMENTS
  // ------------------------------
  useEffect(() => {
    const fetchData = async () => {
      try {
        const userRes = await axios.get("/api/user/profile/");
        const apptRes = await axios.get("/api/user/appointments/");

        setUser(userRes.data);
        setAppointments(apptRes.data);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
      }
    };

    fetchData();
  }, []);

  // ------------------------------
  // CANCEL APPOINTMENT
  // ------------------------------
  const cancelAppointment = async (id) => {
    const updated = appointments.filter((a) => a.id !== id);
    const deleted = appointments.find((a) => a.id === id);

    setAppointments(updated);

    toast(
      (t) => (
        <div className="text-center">
          <p className="font-semibold text-gray-900">Appointment cancelled</p>
          <button
            className="text-blue-600 underline text-sm mt-1"
            onClick={() => {
              setAppointments((prev) => [...prev, deleted]);
              toast.dismiss(t.id);
            }}
          >
            Undo
          </button>
        </div>
      ),
      {
        position: "top-center",
        duration: 3000,
        style: {
          borderRadius: "12px",
          background: "white",
          padding: "14px",
        },
      }
    );

    await axios.post(`/api/user/appointments/${id}/cancel/`);
  };

  if (!user)
    return (
      <div className="w-full flex justify-center py-20 text-lg">
        Loading dashboard...
      </div>
    );

  // SUMMARY COUNTS
  const completed = appointments.filter((a) => a.status === "Done").length;
  const cancelled = appointments.filter((a) => a.status === "Cancelled").length;

  return (
    <div className="w-full min-h-screen bg-gray-100/30 backdrop-blur-md px-8 py-12">
      <Toaster />

      <div className="flex gap-10">

        {/* LEFT PROFILE */}
        <div className="w-1/4">
          <ProfileCard user={user} />
        </div>

        {/* RIGHT SIDE */}
        <div className="w-3/4 space-y-10">
          <div className="flex gap-6">
            <SummaryCard title="All Bookings" value={appointments.length} percentage="100%" />
            <SummaryCard title="Completed" value={completed} percentage={`${(completed / Math.max(appointments.length,1) * 100).toFixed(1)}%`} />
            <SummaryCard title="Cancelled" value={cancelled} percentage={`${(cancelled / Math.max(appointments.length,1) * 100).toFixed(1)}%`} color="orange" />
          </div>

          <AppointmentsList
            appointments={appointments}
            cancelAppointment={cancelAppointment}
          />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ PROFILE CARD ------------------------------ */
function ProfileCard({ user }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl shadow-xl rounded-3xl p-6 hover:scale-[1.02] transition-all">
      <div className="flex flex-col items-center">

        {/* FIXED PLACEHOLDER IF USER HAS NO IMAGE */}
        <img
          src={user.profile_picture || "/default-avatar.png"}
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
          <InfoCard label="Gender" value={user.gender || "Not set"} />
          <InfoCard label="Joined" value={new Date(user.date_joined).toDateString()} />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ label, value }) {
  return (
    <div className="bg-white/50 backdrop-blur p-3 rounded-xl">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value}</p>
    </div>
  );
}

/* ------------------------------ SUMMARY CARDS ------------------------------ */
function SummaryCard({ title, value, percentage, color = "blue" }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl w-1/3 p-6 rounded-3xl shadow-md hover:scale-[1.03] transition-all">
      <p className="text-gray-600">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      <p className={`text-${color}-500 mt-1 font-medium`}>{percentage}</p>
    </div>
  );
}

/* ------------------------------ APPOINTMENTS LIST ------------------------------ */
function AppointmentsList({ appointments, cancelAppointment }) {
  return (
    <div className="bg-white/50 backdrop-blur-xl shadow-lg p-6 rounded-3xl">
      <h2 className="text-xl font-semibold mb-4">Appointments</h2>

      <div className="space-y-4">
        {appointments.length === 0 && (
          <p className="text-center text-gray-500 py-6">
            No appointments yet.
          </p>
        )}

        {appointments.map((item) => (
          <div
            key={item.id}
            className="flex justify-between items-center bg-white/40 p-4 rounded-xl hover:shadow-lg hover:scale-[1.01] transition-all"
          >
            <p className="font-bold text-gray-700">
              {new Date(item.date).toDateString()}
            </p>

            <div className="w-1/3">
              <p className="font-semibold">{item.title}</p>
              <p className="text-xs text-gray-500">
                {item.start_time} – {item.end_time}
              </p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-sm ${
                item.status === "Done"
                  ? "bg-green-100 text-green-600"
                  : item.status === "Booked"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-red-100 text-red-600"
              }`}
            >
              {item.status}
            </span>

            <p className="font-semibold">₹{item.price}</p>

            <button
              onClick={() => cancelAppointment(item.id)}
              className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm"
            >
              Cancel
            </button>

            <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">
              Pay
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
