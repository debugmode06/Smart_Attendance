// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
  const location = useLocation();
  const [isChecking, setIsChecking] = useState(true);
  const [shouldRedirect, setShouldRedirect] = useState(null);

  useEffect(() => {
    // Read from localStorage
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem("user");
    
    console.log("[ProtectedRoute] Checking access for:", location.pathname);
    console.log("[ProtectedRoute] Token exists:", !!token);
    console.log("[ProtectedRoute] User data:", userStr);

    // Not logged in - redirect to login
    if (!token) {
      console.log("[ProtectedRoute] No token - redirecting to login");
      setShouldRedirect("/login");
      setIsChecking(false);
      return;
    }

    let user;
    try {
      user = JSON.parse(userStr || "{}");
    } catch (e) {
      console.error("[ProtectedRoute] Failed to parse user data:", e);
      setShouldRedirect("/login");
      setIsChecking(false);
      return;
    }

    const userRole = user?.role;
    console.log("[ProtectedRoute] User role:", userRole);
    console.log("[ProtectedRoute] Allowed roles:", allowedRoles);

    if (!userRole) {
      console.log("[ProtectedRoute] No role found - redirecting to login");
      setShouldRedirect("/login");
      setIsChecking(false);
      return;
    }

    // Check if user's role is allowed for this route
    if (allowedRoles && !allowedRoles.includes(userRole)) {
      const correctPath = `/${userRole}/dashboard`;
      console.log("[ProtectedRoute] Role mismatch - redirecting to:", correctPath);
      setShouldRedirect(correctPath);
      setIsChecking(false);
      return;
    }

    console.log("[ProtectedRoute] Access granted");
    setShouldRedirect(null);
    setIsChecking(false);
  }, [location.pathname, allowedRoles]);

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect if needed
  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} state={{ from: location }} replace />;
  }

  // User has correct role - allow access
  return children;
}

