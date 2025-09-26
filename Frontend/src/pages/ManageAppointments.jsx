import React, { useState, useEffect } from "react";
import { adminFetch } from "../lib/api";
import ConfirmDialog from "../components/ConfirmDialog";

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [current, setCurrent] = useState(null);

  const fetchAppointments = async () => {
    try { setAppointments(await adminFetch("/appointments/")); } 
    catch (err) { console.error(err.message); }
  };

  useEffect(() => {
    fetchAppointments().finally(() => setLoading(false));
  }, []);

  const handleDelete = async () => {
    try {
      await adminFetch(`/appointments/${current.id}/`, "DELETE");
      setConfirmOpen(false); setCurrent(null); fetchAppointments();
    } catch (err) { console.error(err.message); }
  };

  return (
    <div className="p-8 min-h-screen bg-gray-900 text-white">
      <h1 className="text-3xl font-bold mb-6">Manage Appointments</h1>

      {loading ? <p>Loading...</p> : (
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="py-2 px-4">Doctor</th>
              <th className="py-2 px-4">Patient</th>
              <th className="py-2 px-4">Date & Time</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id} className="border-b border-gray-700 hover:bg-gray-800">
                <td className="py-2 px-4">{a.doctor_name}</td>
                <td className="py-2 px-4">{a.patient_email}</td>
                <td className="py-2 px-4">{new Date(a.date_time).toLocaleString()}</td>
                <td className="py-2 px-4">{a.status}</td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    className="px-2 py-1 bg-red-600 rounded hover:bg-red-500"
                    onClick={() => { setCurrent(a); setConfirmOpen(true); }}
                  >Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <ConfirmDialog open={confirmOpen} onClose={() => setConfirmOpen(false)} onConfirm={handleDelete} message={`Are you sure you want to delete this appointment?`} />
    </div>
  );
}