import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

/**
 * RiderRoute
 * - Wrappa rider pages
 * - Only accessible to users with role "rider"
 * - Redirect others to homepage
 */
export default function RiderRoute({ children }) {
  const { user } = useAuth();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (user.role !== "rider") {
    // Logged in but not a rider
    return <Navigate to="/" replace />;
  }

  // Logged in and rider
  return children;
}
