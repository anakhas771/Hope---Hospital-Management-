// src/services/appointments.js
import { API_URL } from "../lib/api";

export async function verifyPayment(paymentId, doctorId, datetime, notes = "") {
  const stored = localStorage.getItem("user");

  if (!stored) throw new Error("User not logged in");

  const user = JSON.parse(stored);
  const token = user.token;

  if (!token) throw new Error("User not authenticated");

  const res = await fetch(`${API_URL}/accounts/appointments/verify_payment/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // ← FIXED
    },
    body: JSON.stringify({
      payment_id: paymentId,
      doctor: doctorId,
      appointment_datetime: datetime,
      notes: notes || "",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    console.error("verifyPayment error:", data);
    throw new Error(data.detail || "Error verifying payment");
  }

  return data;
}
