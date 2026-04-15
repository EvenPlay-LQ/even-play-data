import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

interface GuestRouteProps {
  children: ReactNode;
}

const GuestRoute = ({ children }: GuestRouteProps) => {
  const { session, loading: authLoading } = useAuth();
  const { profile, getDashboardPath } = useProfile();

  // Wait until both auth AND profile are fully resolved before deciding.
  // Without the `!profile` check there is a race: auth resolves (session is set),
  // but useProfile's fetch hasn't completed yet, so profile is still null and
  // getDashboardPath() incorrectly returns "/setup".
  if (authLoading || (session && !profile)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (session && profile) {
    const dashboardPath = getDashboardPath();
    return <Navigate to={dashboardPath} replace />;
  }

  return <>{children}</>;
};

export default GuestRoute;
