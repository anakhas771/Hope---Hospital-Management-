// src/services/appointments.js
import { apiFetch } from "../lib/api";

export async function verifyPayment(paymentId, doctorId, dateTime, notes = "") {
  // Get the user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  
  if (!user || !user.token) {
    throw new Error("User not authenticated. Please login again.");
  }

  const token = user.token; // Make sure this is the access token

  try {
    const res = await apiFetch(
      "/appointments/verify_payment/", // endpoint
      "POST",                          // method
      {
        payment_id: paymentId,
        doctor_id: doctorId,
        date_time: dateTime,
        notes,
      },
      token
    );

    return res;
  } catch (err) {
    // Handle JWT expiration or invalid token
    if (err.message.includes("token")) {
      // Optional: log user out automatically
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    throw new Error(`Error saving appointment: ${err.message}`);
  }
}