// src/App.jsx
import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

// Theme Context Provider
import { ThemeProvider } from "./context/ThemeContext";

// Layout Components
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Services from "./components/Services";
import Departments from "./components/Departments";
import Footer from "./components/Footer";
import PageWrapper from "./components/PageWrapper";
import AdminRoute from "./components/AdminRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Lazy-loaded Auth Pages
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const ForgotPasswordPage = lazy(() => import("./pages/ForgotPasswordPage"));
const ChangePasswordPage = lazy(() => import("./pages/ChangePasswordPage"));

// Lazy-loaded Admin Pages
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ManageDepartments = lazy(() => import("./pages/ManageDepartments"));
const ManageDoctors = lazy(() => import("./pages/ManageDoctors"));
const ManageAppointments = lazy(() => import("./pages/ManageAppointments"));

// Lazy-loaded User & Department Pages
const CardiologyPage = lazy(() => import("./pages/CardiologyPage"));
const NeurologyPage = lazy(() => import("./pages/NeurologyPage"));
const PediatricsPage = lazy(() => import("./pages/PediatricsPage"));
const OrthopedicsPage = lazy(() => import("./pages/OrthopedicsPage"));
const EmergencyPage = lazy(() => import("./pages/EmergencyPage"));
const RadiologyPage = lazy(() => import("./pages/RadiologyPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));

// Dashboard + Appointments
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const AppointmentPage = lazy(() => import("./pages/AppointmentPage"));
const PaymentPage = lazy(() => import("./pages/PaymentPage"));

// Loading fallback spinner
const PageFallback = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center">
    <div className="w-12 h-12 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
    <p className="mt-4 text-cyan-200 text-sm font-medium animate-pulse">Loading experience...</p>
  </div>
);

// Glass Wrapper
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
      <Suspense fallback={<PageFallback />}>
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
            ].map(({ path, component: Component }) => (
              <Route
                key={path}
                path={path}
                element={
                  <div className="flex items-center justify-center min-h-screen px-6">
                    <GlassSection>
                      <Component />
                    </GlassSection>
                  </div>
                }
              />
            ))}

            {/* Department Pages */}
            {[
              { path: "cardiology", component: CardiologyPage },
              { path: "neurology", component: NeurologyPage },
              { path: "pediatrics", component: PediatricsPage },
              { path: "orthopedics", component: OrthopedicsPage },
              { path: "emergency", component: EmergencyPage },
              { path: "radiology", component: RadiologyPage },
            ].map(({ path, component: Component }) => (
              <Route
                key={path}
                path={`/departments/${path}`}
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
            ))}

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <Navbar />
                    <DashboardPage />
                    <Footer />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />
            {/* User Settings */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <PageWrapper>
                    <Navbar />
                    <SettingsPage />
                    <Footer />
                  </PageWrapper>
                </ProtectedRoute>
              }
            />
            {/* Appointments & Payment */}
            <Route path="/appointment" element={<AppointmentPage />} />
            <Route path="/payment" element={<PaymentPage />} />

            {/* Admin Login */}
            <Route path="/admin-login" element={<AdminLogin />} />

            {/* Admin Panel */}
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

            {/* Redirect old admin path */}
            <Route
              path="/admin-dashboard"
              element={<Navigate to="/admin" replace />}
            />
          </Routes>
        </AnimatePresence>
      </Suspense>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        {" "}
        {/* 👈 FIXED: WRAPPING ENTIRE APP */}
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
      </ThemeProvider>
    </ErrorBoundary>
  );
}
