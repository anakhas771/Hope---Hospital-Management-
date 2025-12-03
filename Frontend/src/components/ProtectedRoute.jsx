// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const access = localStorage.getItem("access");

  if (!access) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
