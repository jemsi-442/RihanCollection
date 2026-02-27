import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user } = useAuth();

  if (user === undefined) {
    // auth state bado ina-load
    return (
      <div className="h-screen flex items-center justify-center">
        <span className="text-gray-500">Loading...</span>
      </div>
    );
  }

  if (!user) {
    // user haiko → redirect login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    // user haiko kwenye allowed roles → redirect home
    return <Navigate to="/" replace />;
  }

  return children;
}
