import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";

export default function DashboardPage() {
  const [appointments, setAppointments] = useState([
    { id: 1, date: "29 Sep", title: "Plumbing", time: "11:00–13:00", status: "Cancelled", price: "$50" },
    { id: 2, date: "15 Oct", title: "Carpenting", time: "13:45–15:30", status: "Booked", price: "$345" },
    { id: 3, date: "11 Nov", title: "Painting", time: "9:00–12:30", status: "Done", price: "$130" },
    { id: 4, date: "13 Apr", title: "Hair Drying", time: "11:00–13:00", status: "Done", price: "$50" },
    { id: 5, date: "24 Feb", title: "Blueprint Structure", time: "9:00–12:30", status: "Booked", price: "$80" }
  ]);

  const cancelAppointment = (id) => {
    const updated = appointments.filter(a => a.id !== id);
    const deleted = appointments.find(a => a.id === id);
    setAppointments(updated);

    toast((t) => (
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
    ), {
      position: "top-center",
      duration: 4000,
      style: {
        borderRadius: "10px",
        background: "white",
        padding: "12px"
      }
    });
  };

  return (
    <div className="w-full min-h-screen bg-gray-100/30 backdrop-blur-md px-6 py-10">

      <Toaster />

      <div className="flex gap-8">

        {/* ---------------- LEFT PROFILE CARD ---------------- */}
        <div className="w-1/4">
          <div className="bg-white/40 backdrop-blur-xl shadow-xl rounded-3xl p-6 transition-all duration-300 hover:scale-[1.02]">
            <div className="flex flex-col items-center">
              <img
                src="https://i.pravatar.cc/200"
                className="w-28 h-28 rounded-full border-4 border-white shadow-lg"
                alt=""
              />

              <h2 className="mt-4 text-xl font-bold">Harriet Nunez</h2>
              <span className="mt-1 text-sm text-green-700 bg-green-100 px-3 py-1 rounded-full">
                New Client
              </span>

              <button className="mt-4 bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded-xl">
                Add New Appointment
              </button>

              {/* Profile Details */}
              <div className="mt-6 w-full space-y-3">
                <div className="bg-white/50 backdrop-blur p-3 rounded-xl">
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">runolsfdir.gillian@hotmail.com</p>
                </div>

                <div className="bg-white/50 backdrop-blur p-3 rounded-xl">
                  <p className="text-xs text-gray-500">Gender</p>
                  <p className="text-sm font-medium">Female</p>
                </div>

                <div className="bg-white/50 backdrop-blur p-3 rounded-xl">
                  <p className="text-xs text-gray-500">Alerts</p>
                  <p className="text-sm font-medium">Allows Marketing Notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ---------------- RIGHT CONTENT SECTION ---------------- */}
        <div className="w-3/4 space-y-8">

          {/* ----------- TOP SUMMARY CARDS ----------- */}
          <div className="flex gap-6">
            <SummaryCard title="All Bookings" value="5" percentage="35.67%" />
            <SummaryCard title="Completed" value="2" percentage="25%" />
            <SummaryCard title="Cancelled" value="5" percentage="35.67%" color="orange" />
          </div>

          {/* ----------- APPOINTMENTS LIST ----------- */}
          <div className="bg-white/50 backdrop-blur-xl shadow-lg p-6 rounded-3xl">
            <h2 className="text-xl font-semibold mb-4">Appointments</h2>

            <div className="space-y-4">
              {appointments.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center bg-white/40 p-4 rounded-xl hover:shadow-lg transition-all"
                >
                  {/* DATE + TITLE */}
                  <div>
                    <p className="font-bold text-gray-700">{item.date}</p>
                  </div>

                  <div className="w-1/3">
                    <p className="font-semibold">{item.title}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>

                  {/* STATUS */}
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

                  {/* PRICE */}
                  <p className="font-semibold">{item.price}</p>

                  {/* CANCEL BUTTON */}
                  <button
                    onClick={() => cancelAppointment(item.id)}
                    className="ml-3 px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-xl"
                  >
                    Cancel
                  </button>

                  {/* Pay Button */}
                  <button className="ml-3 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                    Pay
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* SUMMARY CARD COMPONENT */
function SummaryCard({ title, value, percentage, color = "blue" }) {
  return (
    <div className="bg-white/40 backdrop-blur-xl w-1/3 p-6 rounded-3xl shadow-md transition-all hover:scale-[1.03] hover:shadow-xl">
      <p className="text-gray-600">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      <p className={`text-${color}-500 font-medium mt-1`}>{percentage}</p>
    </div>
  );
}
