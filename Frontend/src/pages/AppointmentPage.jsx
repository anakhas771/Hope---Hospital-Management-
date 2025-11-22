// src/pages/AppointmentPage.jsx
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const AppointmentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // If no doctor data → redirect back
  useEffect(() => {
    if (!location.state) {
      navigate("/doctors");
    }
  }, [location, navigate]);

  // Extract doctor data
  const doctor = location.state || {};

  const doctorId = doctor.id;
  const doctorName = doctor.name;
  const department = doctor.department || doctor.department_name;
  const specialization = doctor.specialization;
  const education = doctor.education;
  const experience = doctor.experience;
  const availability = doctor.availability;
  const rating = doctor.rating;
  const patients_count = doctor.patients_count;
  const profile_image = doctor.profile_image || doctor.image;

  // Form fields
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState("");
  const [notes, setNotes] = useState("");

  const availableTimes = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDate || !selectedTime) {
      alert("⚠️ Please select date and time.");
      return;
    }

    const backendDate = format(selectedDate, "yyyy-MM-dd");
    const displayDate = format(selectedDate, "EEE, dd MMM yyyy");

    navigate("/payment", {
      state: {
        doctorId,
        doctorName,
        department,
        amount: 500,
        date: backendDate,
        time: selectedTime,
        formattedDate: displayDate,
        notes,
      },
    });
  };

  // Generate initials if no image
  const initials =
    doctorName?.split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase() || "DR";

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
            {initials}
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

      {/* Appointment Booking Form */}
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

          {/* Time Slots */}
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
