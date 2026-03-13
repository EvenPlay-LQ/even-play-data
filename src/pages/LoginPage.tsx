import { useState } from "react";
import { motion } from "framer-motion";
import { Zap, ArrowRight, User, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";

type AuthMode = "login" | "signup";
type UserRole = "athlete" | "institution";

const LoginPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("athlete");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo navigation — will connect to auth later
    if (role === "athlete") {
      navigate("/athlete");
    } else {
      navigate("/institution");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative items-center justify-center p-12">
        <div className="absolute inset-0">
          <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-energy/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/3 right-1/4 w-56 h-56 bg-gold/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-2 mb-8">
            <Zap className="h-8 w-8 text-primary" />
            <span className="font-display font-bold text-2xl text-primary-foreground">Even Playground</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">
            Your sports career starts here
          </h2>
          <p className="text-primary-foreground/60">
            Track performance, verify stats, discover talent — all in one platform.
          </p>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Zap className="h-6 w-6 text-primary" />
            <span className="font-display font-bold text-xl text-foreground">Even Playground</span>
          </div>

          <h1 className="text-2xl font-display font-bold text-foreground mb-2">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {mode === "login" ? "Sign in to continue" : "Join the platform"}
          </p>

          {mode === "signup" && (
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                type="button"
                onClick={() => setRole("athlete")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === "athlete"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <User className={`h-5 w-5 ${role === "athlete" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <div className={`text-sm font-semibold ${role === "athlete" ? "text-foreground" : "text-muted-foreground"}`}>Athlete</div>
                  <div className="text-xs text-muted-foreground">Track performance</div>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setRole("institution")}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                  role === "institution"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <Building2 className={`h-5 w-5 ${role === "institution" ? "text-primary" : "text-muted-foreground"}`} />
                <div className="text-left">
                  <div className={`text-sm font-semibold ${role === "institution" ? "text-foreground" : "text-muted-foreground"}`}>Institution</div>
                  <div className="text-xs text-muted-foreground">Manage teams</div>
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "signup" && (
              <div>
                <Label htmlFor="name" className="text-foreground">Full Name</Label>
                <Input id="name" placeholder="Your name" className="mt-1.5" />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-foreground">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password" className="text-foreground">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" className="mt-1.5" />
            </div>
            <Button type="submit" variant="hero" className="w-full" size="lg">
              {mode === "login" ? "Sign In" : "Create Account"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              className="text-primary font-medium hover:underline"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
            >
              {mode === "login" ? "Sign Up" : "Sign In"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
