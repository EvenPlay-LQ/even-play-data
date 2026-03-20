import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface GuestRouteProps {
  children: ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { getDashboardPath, loading: profileLoading } = useProfile();

  if (authLoading || (session && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session) {
    const dashboardPath = getDashboardPath();
    console.log(`[GuestRoute] Authenticated user detected. Redirecting to: ${dashboardPath}`);
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
