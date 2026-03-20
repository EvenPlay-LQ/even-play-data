import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, CheckCircle2, Zap } from "lucide-react";
import { SEO } from "@/components/SEO";

import { useProfile } from "@/hooks/useProfile";

const AuthCallback = () => {
  const navigate = useNavigate();
  const { loading, getDashboardPath } = useProfile();

  useEffect(() => {
    if (loading) return;

    // Small delay to allow Supabase to process the hash/session
    // and to show the beautiful branded screen
    const timer = setTimeout(() => {
      navigate(getDashboardPath());
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate, loading, getDashboardPath]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <SEO title="Verifying your account | Even Playground" />
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-energy/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
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
          Verifying your account
        </h2>
        
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Success! We're finalizing your sports credentials. You'll be redirected to complete your profile in just a moment.
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 text-stat-green bg-stat-green/10 px-4 py-2 rounded-full text-sm font-medium">
            <CheckCircle2 className="w-4 h-4" />
            Email Verified Successfully
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground text-sm mt-4">
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
            Syncing performance data...
          </div>
        </div>
      </motion.div>

      <div className="mt-8 text-muted-foreground/50 text-xs font-medium tracking-widest uppercase relative z-10 transition-opacity animate-pulse">
        Powered by Even Playground
      </div>
    </div>
  );
};

export default AuthCallback;
