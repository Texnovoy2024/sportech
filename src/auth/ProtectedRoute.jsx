// src/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";

/**
 * Usage:
 * <ProtectedRoute allowed={['player']}><PlayerLayout/></ProtectedRoute>
 *
 * If `allowed` is omitted, it only checks authentication.
 */
export default function ProtectedRoute({ children, allowed = null }) {
  const { user, ready } = useAuth();
  const location = useLocation();

  // while we check auth, you can show loader (ready === false)
  if (!ready) return null;

  if (!user) {
    // redirect to login and remember where we came from
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If allowed roles provided, check that user's role is included
  if (Array.isArray(allowed) && allowed.length > 0) {
  const role = user.role || (user.roles && user.roles[0]);
  console.log("[ProtectedRoute] user role:", role, "allowed:", allowed);
  if (!role || !allowed.includes(role)) {
    // go to a friendly forbidden page instead of home or alert
    return <Navigate to="/forbidden" replace />;
  }
}


  return children;
}
