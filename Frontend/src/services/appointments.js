// src/services/appointments.js
import { apiFetch } from "../lib/api";
import { getValidToken } from "../utils/getToken";

export async function verifyPayment(paymentId, doctorId, dateTime, notes = "") {
  // ensure user logged in and token valid
  const token = await getValidToken();
  if (!token) {
    throw new Error("User not authenticated. Please login again.");
  }

  // apiFetch will attach token if omitted, but we can pass token explicitly
  const payload = {
    payment_id: paymentId,
    doctor_id: doctorId,
    date_time: dateTime, // ISO string expected by backend
    notes,
  };

  // Using apiFetch (which will attempt refresh via getValidToken internally)
  const res = await apiFetch("/appointments/verify_payment/", "POST", payload, token);
  return res;
}
