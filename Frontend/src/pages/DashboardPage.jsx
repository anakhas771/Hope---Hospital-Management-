import React, { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import {
  User,
  CalendarCheck,
  Clock,
  Phone,
  Mail,
  Undo2,
  CreditCard,
  Activity,
} from "lucide-react";

import { getUserProfile, getAppointments, cancelAppointment } from "../services/appointments";

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [appointments, setAppointments] = useState([]);

  const [lastCancelled, setLastCancelled] = useState(null);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const profile = await getUserProfile();
        const appts = await getAppointments();

        setUser(profile);
        setAppointments(appts);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load dashboard.");
      }
    };
    fetchData();
  }, []);

  const formatJoined = (date) => {
    if (!date) return "—";
    const d = new Date(date);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleCancel = async (id) => {
    setLastCancelled(id);

    toast(
      (t) => (
        <div className="text-center">
          <p className="text-lg font-semibold">Appointment Cancelled</p>
          <button
            className="mt-2 px-4 py-1 rounded-xl bg-white/20 border border-white hover:bg-white/30 transition"
            onClick={() => undoCancel(t, id)}
          >
            <Undo2 className="inline-block w-4 mr-1" />
            Undo
          </button>
        </div>
      ),
      {
        duration: 4000,
        position: "top-center",
        style: {
          background: "rgba(20,20,20,0.9)",
          color: "white",
          backdropFilter: "blur(10px)",
        },
      }
    );

    await cancelAppointment(id);

    setAppointments((prev) => prev.filter((a) => a.id !== id));
  };

  const undoCancel = (toastId, id) => {
    toast.dismiss(toastId);

    toast.success("Undo successful!", {
      position: "top-center",
      style: {
        background: "rgba(20,20,20,0.8)",
        color: "white",
      },
    });

    // Restore appointment (demo)
    setAppointments((prev) => [
      ...prev,
      lastCancelled,
    ]);
  };

  if (!user)
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white p-6 md:p-10">

      <Toaster />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">

        {/* LEFT — Profile Card */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-1 bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10"
        >
          <div className="flex flex-col items-center">
            <User className="w-20 h-20 mb-3 text-white/80" />

            <h2 className="text-2xl font-bold">
              {user.first_name} {user.last_name}
            </h2>

            <p className="text-white/60 mt-1">{user.email}</p>

            <div className="mt-6 w-full space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="font-semibold flex items-center">
                  <CalendarCheck className="w-4 mr-2" /> Joined
                </p>
                <p className="text-white/70 mt-1">
                  {formatJoined(user.date_joined)}
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="font-semibold flex items-center">
                  <Phone className="w-4 mr-2" /> Phone
                </p>
                <p className="text-white/70 mt-1">
                  {user.phone || "Not added"}
                </p>
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                <p className="font-semibold flex items-center">
                  <Mail className="w-4 mr-2" /> Contact
                </p>
                <p className="text-white/70 mt-1">
                  Reach out anytime!
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE CARDS */}
        <div className="col-span-2 space-y-8">

          {/* Active Appointments */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/10"
          >
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Clock className="w-5 mr-2" /> Upcoming Appointments
            </h2>

            {appointments.length === 0 && (
              <p className="text-white/60">No appointments scheduled.</p>
            )}

            <div className="space-y-4">
              {appointments.map((appt) => (
                <motion.div
                  key={appt.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-white/5 border border-white/10 rounded-xl flex justify-between items-center"
                >
                  <div>
                    <p className="font-semibold">{appt.doctorName}</p>
                    <p className="text-white/60 text-sm">{appt.date}</p>
                  </div>

                  <button
                    onClick={() => handleCancel(appt.id)}
                    className="px-4 py-2 bg-red-500/60 hover:bg-red-500 rounded-xl transition"
                  >
                    Cancel
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Other Cards */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10 shadow-xl">
              <h3 className="font-bold text-lg flex items-center">
                <CreditCard className="w-5 mr-2" /> Payments
              </h3>
              <p className="text-white/60 mt-2">
                View your payment history and invoices.
              </p>
            </div>

            <div className="p-6 bg-white/10 rounded-2xl backdrop-blur-lg border border-white/10 shadow-xl">
              <h3 className="font-bold text-lg flex items-center">
                <Activity className="w-5 mr-2" /> Activity Logs
              </h3>
              <p className="text-white/60 mt-2">
                Track your recent actions and updates.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
