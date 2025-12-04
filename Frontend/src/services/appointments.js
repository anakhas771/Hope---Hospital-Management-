// src/services/appointments.js
import { apiFetch } from "../lib/api";
import { getValidToken } from "../utils/getToken";

export async function verifyPayment(paymentId, doctorId, dateTime, notes = "") {
  // Ensure user logged in and token is valid
  const token = await getValidToken();
  if (!token) {
    throw new Error("User not authenticated. Please login again.");
  }

  // Ensure datetime is proper ISO format
  const isoDateTime = new Date(dateTime).toISOString();

  const payload = {
    payment_id: paymentId,
    doctor_id: doctorId,
    date_time: isoDateTime,
    notes,
  };

  try {
    // ↑ Do NOT pass token manually. apiFetch attaches token automatically.
    const res = await apiFetch("/appointments/verify_payment/", "POST", payload);
    return res;
  } catch (err) {
    console.error("verifyPayment error:", err);
    throw new Error(err?.message || "Payment verification failed");
  }
}
