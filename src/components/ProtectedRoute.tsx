import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading, session } = useAuth();
  const { profile, loading: profileLoading, isMasterAdmin, setupComplete } = useProfile();

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
  if (!setupComplete) {
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
