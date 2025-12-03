// src/services/appointments.js
import { apiFetch } from "../lib/api";

export async function verifyPayment(paymentId, doctorId, dateTime, notes = "") {
  
  const token = localStorage.getItem("access");

  if (!token) {
    throw new Error("User not authenticated. Please login again.");
  }

  try {
    const res = await apiFetch(
      "/appointments/verify_payment/",
      "POST",
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
    throw new Error(`Error saving appointment: ${err.message}`);
  }
}
