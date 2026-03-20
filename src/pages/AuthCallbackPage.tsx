import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import LoadingScreen from "@/components/ui/LoadingScreen";

/**
 * Handles the redirect after email confirmation.
 * Supabase appends tokens to the URL hash; this page exchanges them
 * and routes the user to the correct dashboard.
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      // Supabase client auto-detects tokens in the URL hash
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError("Authentication failed. Please try signing in again.");
        setTimeout(() => navigate("/login", { replace: true }), 2500);
        return;
      }

      // Look up user profile to determine where to route
      const { data: profile } = await supabase
        .from("profiles")
        .select("user_type, name")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!profile || !profile.name || !profile.user_type) {
        navigate("/setup", { replace: true });
        return;
      }

      switch (profile.user_type) {
        case "institution":
          navigate("/dashboard/institution", { replace: true });
          break;
        case "athlete":
          navigate("/dashboard/athlete", { replace: true });
          break;
        case "fan":
          navigate("/buzz", { replace: true });
          break;
        default:
          navigate("/setup", { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-2">
          <p className="text-destructive font-medium">{error}</p>
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return <LoadingScreen />;
};

export default AuthCallbackPage;
