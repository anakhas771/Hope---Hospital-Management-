// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Departments from "./components/Departments";
import Footer from "./components/Footer";
import PageWrapper from "./components/PageWrapper";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminLayout from "./components/AdminLayout";

import LoginPage from "./pages/LoginPage";
import SignUpPage from "./pages/SignUpPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ChangePasswordPage from "./pages/ChangePasswordPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminLogin from "./pages/AdminLogin";
import ManageDepartments from "./pages/ManageDepartments";
import ManageDoctors from "./pages/ManageDoctors";
import ManageAppointments from "./pages/ManageAppointments";

import CardiologyPage from "./pages/CardiologyPage";
import NeurologyPage from "./pages/NeurologyPage";
import PediatricsPage from "./pages/PediatricsPage";
import OrthopedicsPage from "./pages/OrthopedicsPage";
import EmergencyPage from "./pages/EmergencyPage";
import RadiologyPage from "./pages/RadiologyPage";

import DashboardPage from "./pages/DashboardPage";
import AppointmentPage from "./pages/AppointmentPage";
import PaymentPage from "./pages/PaymentPage";

// GlassSection wrapper
const GlassSection = ({ children }) => (
  <div className="px-6 py-10">
    <div className="glass-card p-8 space-y-6 hover:backdrop-blur-lg transition-all duration-300">
      {children}
    </div>
  </div>
);

function AppContent() {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-800 via-blue-700 to-blue-800 relative text-white overflow-hidden">
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Landing Page */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <GlassSection>
                  <Hero />
                </GlassSection>
                <GlassSection>
                  <Services />
                </GlassSection>
                <GlassSection>
                  <Departments />
                </GlassSection>
                <Footer />
              </>
            }
          />

          {/* Auth Pages */}
          {[
            { path: "/login", component: LoginPage },
            { path: "/signup", component: SignUpPage },
            { path: "/forgot-password", component: ForgotPasswordPage },
            { path: "/change-password", component: ChangePasswordPage },
          ].map((item) => {
            const Component = item.component;
            return (
              <Route
                key={item.path}
                path={item.path}
                element={
                  <div className="flex items-center justify-center min-h-screen px-6">
                    <GlassSection>
                      <Component />
                    </GlassSection>
                  </div>
                }
              />
            );
          })}

          {/* Department Pages */}
          {[
            { path: "cardiology", component: CardiologyPage },
            { path: "neurology", component: NeurologyPage },
            { path: "pediatrics", component: PediatricsPage },
            { path: "orthopedics", component: OrthopedicsPage },
            { path: "emergency", component: EmergencyPage },
            { path: "radiology", component: RadiologyPage },
          ].map((item) => {
            const Component = item.component;
            return (
              <Route
                key={item.path}
                path={`/departments/${item.path}`}
                element={
                  <PageWrapper>
                    <Navbar />
                    <GlassSection>
                      <Component />
                    </GlassSection>
                    <Footer />
                  </PageWrapper>
                }
              />
            );
          })}

          {/* User Dashboard */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <PageWrapper>
                  <Navbar />
                  <GlassSection>
                    <DashboardPage />
                  </GlassSection>
                  <Footer />
                </PageWrapper>
              </ProtectedRoute>
            }
          />

          <Route path="/appointment" element={<AppointmentPage />} />
          <Route path="/payment" element={<PaymentPage />} />

          {/* Admin Login */}
          <Route path="/admin-login" element={<AdminLogin />} />

          {/* Admin Dashboard & Nested Admin Pages */}
          <Route
            path="/admin/*"
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route index element={<AdminDashboardPage />} />
            <Route path="departments" element={<ManageDepartments />} />
            <Route path="doctors" element={<ManageDoctors />} />
            <Route path="appointments" element={<ManageAppointments />} />
          </Route>

          {/* Redirect old admin-dashboard URL */}
          <Route
            path="/admin-dashboard"
            element={<Navigate to="/admin" replace />}
          />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <PayPalScriptProvider
          options={{
            "client-id":
              "AaMufrQQFOuE7gvgF1hjBWE8U20g--oX2vfyzR8n1UMy_PdYVd6wT435rkGQcxOo4PoimaUnjSwmQMz9",
            currency: "USD",
          }}
        >
          <AppContent />
        </PayPalScriptProvider>
      </Router>
    </ErrorBoundary>
  );
}
