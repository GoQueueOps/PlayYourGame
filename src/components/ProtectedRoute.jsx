import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useRole } from "../hooks/useRole";

function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const { role, loading } = useRole();

  // Not logged in → go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wait for role to load
  if (loading) {
    return <div className="flex items-center justify-center h-screen text-white">Loading...</div>;
  }

  // Role restriction exists but user doesn't have it → go home
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default ProtectedRoute;