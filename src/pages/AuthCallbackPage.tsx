import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Zap, AlertCircle } from "lucide-react";
import { SEO } from "@/components/SEO";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

/**
 * Handles the redirect after email confirmation.
 * Supabase appends tokens to the URL hash; this page exchanges them
 * and routes the user to the correct destination.
 *
 * This is the single authoritative handler for /auth/callback.
 */
const AuthCallbackPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase client auto-detects tokens in the URL hash
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          setError("Authentication failed. Please try signing in again.");
          setTimeout(() => navigate("/login", { replace: true }), 3000);
          return;
        }

        // Mark as verified for UI feedback
        setVerified(true);

        // Look up user profile to determine where to route
        const { data: profile } = await supabase
          .from("profiles")
          .select("user_type, name, setup_complete")
          .eq("id", session.user.id)
          .maybeSingle();

        // Small delay to show the branded success screen
        await new Promise(resolve => setTimeout(resolve, 1800));

        if (!profile || !profile.name || !profile.setup_complete) {
          navigate("/setup", { replace: true });
          return;
        }

        // Route all users to community dashboard (Buzz page) after authentication
        navigate("/buzz", { replace: true });
      } catch (err) {
        console.error("[AuthCallbackPage] Unexpected error:", err);
        setError("Something went wrong. Please try signing in again.");
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <SEO title="Authentication Error | Even Playground" />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-4 max-w-sm"
        >
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">Verification Failed</h2>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground">Redirecting to login...</p>
          <Button variant="outline" onClick={() => navigate("/login", { replace: true })}>
            Go to Login
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SEO title="Verifying your account | Even Playground" />

      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-energy/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative z-10 bg-card border border-border p-12 rounded-3xl shadow-elevated max-w-md w-full text-center"
      >
        <div className="flex justify-center mb-8">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="absolute inset-[-8px] border-2 border-dashed border-primary/30 rounded-full"
            />
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary relative z-10">
              <Zap className="w-10 h-10" />
            </div>
          </div>
        </div>

        <h2 className="text-3xl font-display font-bold text-foreground mb-4">
          {verified ? "Email Verified!" : "Verifying your account"}
        </h2>

        <p className="text-muted-foreground mb-10 leading-relaxed">
          {verified
            ? "Your account is confirmed. Taking you to your profile setup..."
            : "Finalizing your sports credentials. Just a moment..."}
        </p>

        <div className="flex flex-col items-center gap-4">
          {verified ? (
            <div className="flex items-center gap-3 text-stat-green bg-stat-green/10 px-4 py-2 rounded-full text-sm font-medium">
              <CheckCircle2 className="w-4 h-4" />
              Email Verified Successfully
            </div>
          ) : (
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              Syncing your account...
            </div>
          )}
        </div>
      </motion.div>

      <div className="mt-8 text-muted-foreground/50 text-xs font-medium tracking-widest uppercase relative z-10 animate-pulse">
        Powered by Even Playground
      </div>
    </div>
  );
};

export default AuthCallbackPage;
