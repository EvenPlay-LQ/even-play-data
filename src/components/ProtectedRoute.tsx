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
  const { profile, loading: profileLoading, isMasterAdmin } = useProfile();

  if (authLoading || (user && !profile && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If no user or no session (unconfirmed email usually results in no session)
  if (!user || !session) {
    return <Navigate to="/login" replace />;
  }

  // Master admins bypass all role checks
  if (requiredRole && !isMasterAdmin) {
    const userRole = profile?.user_type;
    // Handle 'fan' role which is used for 'parent' dashboard
    const effectiveRole = userRole === "fan" ? "parent" : userRole;
    
    if (effectiveRole !== requiredRole) {
      console.warn(`[ProtectedRoute] Access denied. Required: ${requiredRole}, Got: ${effectiveRole}`);
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
