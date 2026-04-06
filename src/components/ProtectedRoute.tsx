import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading, session } = useAuth();
  const { profile, loading: profileLoading, isMasterAdmin, setupComplete } = useProfile();
  const location = useLocation();

  if (authLoading || (user && !profile && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !session) {
    return <Navigate to="/login" replace />;
  }

  // Enforce wizard completion — redirect to /setup if wizard not complete
  // Exception: Allow access to /buzz immediately after signup to prevent loop
  if (!setupComplete && location.pathname !== "/setup") {
    // If user just completed setup (profile exists but setup_complete flag not yet synced),
    // allow them to proceed to /buzz instead of redirecting back to /setup
    if (profile && location.pathname === "/buzz") {
      // Allow access - profile exists, just let them through
      return <>{children}</>;
    }
    return <Navigate to="/setup" replace />;
  }

  // Master admins bypass all role checks
  if (requiredRole && !isMasterAdmin) {
    const userRole = profile?.user_type;
    const effectiveRole = userRole === "fan" ? "parent" : userRole;

    if (effectiveRole !== requiredRole) {
      console.warn(`[ProtectedRoute] Access denied. Required: ${requiredRole}, Got: ${effectiveRole}`);
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
