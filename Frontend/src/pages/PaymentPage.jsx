import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import Lottie from "lottie-react";
import toast, { Toaster } from "react-hot-toast";

import paymentAnimation from "../assets/Payments.json";
import confettiAnimation from "../assets/confetti.json";
import { verifyPayment } from "../services/appointments";

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    doctorName = "",
    doctorId = "",
    amount = 0,
    date = null,
    time = "",
    notes = "",
    department = "",
    formattedDate = null,
  } = location.state || {};

  const [showConfetti, setShowConfetti] = useState(false);
  const [user, setUser] = useState(null);

  // ✅ Check login state
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return navigate("/login");

    try {
      const parsedUser = JSON.parse(storedUser);
      if (!parsedUser?.token) return navigate("/login"); // needs token
      setUser(parsedUser);
    } catch {
      navigate("/login");
    }
  }, [navigate]);

  // ✅ Missing appointment details guard
  if (!doctorName || !doctorId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-black">
        <p>❌ Missing appointment details. Go back and try again.</p>
      </div>
    );
  }

  // ✅ Format time + date
  const formattedTime = time || "-";
  let isoDateTime = null;
  if (date && time) {
    const d = new Date(`${date}T${time}:00`);
    if (!isNaN(d.getTime())) isoDateTime = d.toISOString();
  }

  // ✅ Payment success handler
  const handlePaymentSuccess = async (details) => {
    if (!isoDateTime) {
      toast.error("Invalid date or time.");
      return;
    }

    try {
      await verifyPayment(details.id, doctorId, isoDateTime, notes);

      setShowConfetti(true);
      toast.success(
        `🎉 Payment successful! Appointment booked with Dr. ${doctorName}.`
      );

      setTimeout(() => {
        setShowConfetti(false);
        navigate("/dashboard", { state: { refresh: true } });
      }, 2000);
    } catch (err) {
      console.error("Error saving appointment:", err.message);
      toast.error("Payment succeeded but saving appointment failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 to-gray-800 text-white p-6 relative">
      <Toaster position="bottom-center" reverseOrder={false} />

      {/* 🎊 Confetti animation */}
      {showConfetti && (
        <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center">
          <div className="w-full max-w-2xl">
            <Lottie
              animationData={confettiAnimation}
              loop={false}
              className="w-full h-auto"
            />
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row bg-white/10 backdrop-blur-lg rounded-2xl shadow-xl max-w-4xl w-full relative z-10 overflow-hidden">
        {/* Left side animation */}
        <div className="md:w-1/2 bg-gray-800 flex items-center justify-center p-6">
          <Lottie animationData={paymentAnimation} loop className="w-64 h-64" />
        </div>

        {/* Right side payment section */}
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-6">Payment</h1>
            <div className="space-y-3 mb-6 text-gray-200">
              <p>
                <strong>Doctor:</strong> {doctorName}
              </p>
              <p>
                <strong>Amount:</strong> ₹{amount}
              </p>
              <p>
                <strong>Date:</strong> {formattedDate}
              </p>
              <p>
                <strong>Time:</strong> {formattedTime}
              </p>
              <p>
                <strong>Department:</strong> {department || "General"}
              </p>
            </div>
          </div>

          {/* ✅ PayPal integration */}
          <PayPalButtons
            style={{ layout: "vertical" }}
            createOrder={(data, actions) => {
              return actions.order.create({
                purchase_units: [
                  {
                    description: `Consultation with Dr. ${doctorName}`,
                    amount: { value: amount.toString() },
                  },
                ],
              });
            }}
            onApprove={async (data, actions) => {
              try {
                const details = await actions.order.capture();
                await handlePaymentSuccess(details);
              } catch (err) {
                console.error("PayPal capture error:", err);
                toast.error("Payment failed. Try again.");
              }
            }}
            onError={(err) => {
              console.error("PayPal error:", err);
              toast.error("Payment failed. Try again.");
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
