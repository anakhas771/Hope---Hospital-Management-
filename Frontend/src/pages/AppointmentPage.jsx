// src/pages/AppointmentPage.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const AppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    id: doctorId,
    name: doctorName,
    department,
    specialization,
    education,
    experience,
    availability,
    rating,
    patients_count,
    profile_image,
  } = location.state || {};

  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  const availableTimes = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert("⚠️ Please select date and time.");
      return;
    }

    const rawDate = format(selectedDate, "yyyy-MM-dd"); // backend safe
    const formattedDate = format(selectedDate, "eee, dd MMM yyyy"); // frontend display

    navigate("/payment", {
      state: {
        doctorName,
        doctorId,
        amount: 500,
        date: rawDate,
        time: selectedTime,
        formattedDate,
        notes,
        department,
      },
    });
  };

  return (
    <div className="max-w-6xl mx-auto py-20 px-6 grid grid-cols-1 md:grid-cols-2 gap-10 text-white">
      {/* Doctor Profile */}
      <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-md">
        {profile_image ? (
          <img
            src={profile_image}
            alt={doctorName}
            className="w-32 h-32 rounded-full object-cover mx-auto mb-4 border border-white/30"
          />
        ) : (
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-3xl font-bold mx-auto mb-4">
            {doctorName?.split(" ").map((w) => w[0]).join("")}
          </div>
        )}
        <h2 className="text-2xl font-bold text-center">{doctorName}</h2>
        <p className="text-center text-cyan-300">{specialization}</p>
        <div className="mt-4 space-y-1 text-sm text-gray-200">
          {education && <p>🎓 {education}</p>}
          {experience && <p>🧑‍⚕️ {experience}</p>}
          {availability && <p>⏰ Available: {availability}</p>}
          {rating && <p>⭐ {rating} rating</p>}
          {patients_count && <p>👥 {patients_count} patients</p>}
          {department && <p>🏥 {department}</p>}
        </div>
      </div>

      {/* Appointment Booking */}
      <div className="bg-white/10 rounded-2xl p-6 border border-white/20 shadow-md">
        <h1 className="text-3xl font-bold mb-6">Book Appointment</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date Picker */}
          <div>
            <label className="block mb-1">Select Date</label>
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              minDate={new Date()}
              placeholderText="Click to select a date"
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              calendarClassName="bg-gray-900 text-white rounded-lg"
            />
          </div>

          {/* Available Times */}
          <div>
            <label className="block mb-1">Select Time</label>
            <div className="flex flex-wrap gap-2">
              {availableTimes.map((time) => (
                <button
                  type="button"
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`px-4 py-2 rounded-lg border border-white/20 text-white transition 
                    ${selectedTime === time ? "bg-blue-500" : "bg-white/10"} 
                    hover:bg-blue-400`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block mb-1">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
              rows="3"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 font-semibold shadow-md"
          >
            Proceed to Payment
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentPage;