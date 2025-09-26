// src/components/AdminRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("admin_access_token");
  return token ? children : <Navigate to="/admin-login" replace />;
}