import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, User, Building2, Loader2, Mail, CheckCircle, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validations";

type AuthMode = "login" | "signup" | "forgot" | "verify";
type UserRole = "athlete" | "institution" | "fan";
type AuthView = "role-selection" | "choice" | "form";

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const initialMode = (searchParams.get("mode") as AuthMode) || "login";
  
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [view, setView] = useState<AuthView>(initialMode === "signup" ? "role-selection" : "form");
  const [role, setRole] = useState<UserRole | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    // If we land with mode=login, we skip role selection for now (until they choose signup)
    if (initialMode === "login") {
      setView("form");
      setMode("login");
    } else {
      setView("role-selection");
      setMode("signup");
    }
  }, [initialMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // ── FORGOT PASSWORD ──
    if (mode === "forgot") {
      const result = forgotPasswordSchema.safeParse({ email });
      if (!result.success) {
        setErrors({ email: result.error.issues[0].message });
        return;
      }
      setSubmitting(true);
      console.log(`[Auth] Attempting password reset for: ${email}`);
      console.log(`[Auth] Redirect URL: ${window.location.origin}/reset-password`);
      
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error("[Auth] Reset password error:", error);
        toast({ 
          title: "Reset failed", 
          description: error.message + (error.status === 429 ? " (Too many requests, try again later)" : ""), 
          variant: "destructive" 
        });
      } else {
        console.log("[Auth] Reset email instruction sent successfully.");
        toast({ 
          title: "Check your email", 
          description: "If an account exists for this email, we've sent a password reset link." 
        });
        // Stay on form but show success state or back to login
        setMode("login");
        setView("form");
      }
      setSubmitting(false);
      return;
    }

    // ── SIGNUP ──
    if (mode === "signup") {
      const result = signupSchema.safeParse({ name, email, password });
      if (!result.success) {
        const fieldErrors: Record<string, string> = {};
        result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
        setErrors(fieldErrors);
        return;
      }
      setSubmitting(true);
      const { error } = await signUp(email, password, { name, full_name: name, user_type: role });
      setSubmitting(false);

      if (error) {
        if (error.message?.includes("already registered")) {
          toast({ title: "Email already registered", description: "Try signing in instead.", variant: "destructive" });
        } else if (error.message?.includes("rate limit") || error.message?.includes("email rate")) {
          toast({ title: "Too many sign-up attempts", description: "Email sending is temporarily rate-limited. Please wait a few minutes and try again.", variant: "destructive" });
        } else {
          toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        }
      } else {
        setMode("verify");
      }
      return;
    }

    // ── SIGN IN ──
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => { fieldErrors[issue.path[0] as string] = issue.message; });
      setErrors(fieldErrors);
      return;
    }
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      if (error.message?.includes("Email not confirmed")) {
        setMode("verify");
        toast({ title: "Email not confirmed", description: "Please check your inbox and click the link.", variant: "destructive" });
      } else {
        toast({ title: "Sign in failed", description: error.message, variant: "destructive" });
      }
    } else {
      // Fetch profile for routing
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        // Fallback for master admin if database migration hasn't applied
        if (currentUser.email === "lqlake215@gmail.com") {
          navigate("/admin");
          return;
        }

        const { data: profile } = await supabase.from("profiles")
          .select("user_type, name")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (!profile || !profile.name || !profile.user_type) {
          navigate("/setup");
          return;
        }

        // Route all users to community dashboard (Buzz page) after login
        navigate("/buzz");
      } else {
        navigate("/");
      }
    }
  };

  const handleRoleSelect = (r: UserRole) => {
    setRole(r);
    setView("choice");
  };

  const currentViewTitle = () => {
    if (mode === "verify") return "Check your email";
    if (view === "role-selection") return "Who are you?";
    if (view === "choice") return `Welcome, ${role ? role.charAt(0).toUpperCase() + role.slice(1) : ""}`;
    if (mode === "login") return "Welcome back";
    if (mode === "signup") return "Create your account";
    if (mode === "forgot") return "Reset password";
    return "Even Playground";
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel (Desktop Only) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-energy/10 rounded-full blur-3xl animate-pulse-glow" />
          <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-gold/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: "1s" }} />
        </div>
        <div className="relative z-10 max-w-md">
          <div className="flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/")}>
            <Zap className="h-10 w-10 text-primary" />
            <span className="font-display font-bold text-3xl text-primary-foreground">Even Playground</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-primary-foreground mb-6 leading-tight">
            Elevate your game with verified data.
          </h2>
          <p className="text-lg text-primary-foreground/60 leading-relaxed mb-8">
            The professional hub for athletes, institutions, and fans to unify sports performance tracking.
          </p>
          <div className="flex items-center gap-4 py-6 border-t border-primary-foreground/10">
             <div className="flex -space-x-2">
                {[1,2,3,4].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-muted" />)}
             </div>
             <p className="text-xs text-primary-foreground/40 font-medium uppercase tracking-widest">Joined by 2000+ athletes</p>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background relative overflow-hidden">
        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 flex items-center gap-2 lg:hidden cursor-pointer" onClick={() => navigate("/")}>
          <Zap className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-xl text-foreground">Even Playground</span>
        </div>

        <AnimatePresence mode="wait">
          {/* ── EMAIL VERIFY SCREEN ── */}
          {mode === "verify" ? (
            <motion.div key="verify" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="w-full max-w-md text-center">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-3xl font-display font-bold text-foreground mb-4">Check your email</h1>
              <p className="text-muted-foreground mb-1">We sent a confirmation link to:</p>
              <p className="font-semibold text-foreground mb-8 text-lg">{email}</p>
              <div className="bg-muted/30 rounded-2xl p-6 text-sm text-left text-muted-foreground mb-8 space-y-3 border border-border">
                <div className="flex gap-3"><CheckCircle className="h-5 w-5 text-stat-green flex-shrink-0" /><span>Click the link to verify your account</span></div>
                <div className="flex gap-3"><CheckCircle className="h-5 w-5 text-stat-green flex-shrink-0" /><span>Check your spam folder if missing</span></div>
              </div>
              <Button variant="hero" className="w-full h-12" onClick={() => { setMode("login"); setView("form"); }}>Back to Sign In</Button>
            </motion.div>
          ) : view === "role-selection" ? (
            /* ── VIEW 1: ROLE SELECTION ── */
            <motion.div key="roles" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">Who are you?</h1>
              <p className="text-muted-foreground mb-8">Select your role to get started with Even Playground.</p>
              
              <div className="grid grid-cols-1 gap-4 mb-8">
                {([
                  { id: "athlete", label: "Athlete", sub: "I want to track my performance and get scouted.", icon: User, color: "text-energy", bg: "bg-energy/10" },
                  { id: "institution", label: "Institution / Club", sub: "I want to manage teams and verify player data.", icon: Building2, color: "text-stat-blue", bg: "bg-stat-blue/10" },
                  { id: "fan", label: "Parent / Fan", sub: "I want to follow athletes and monitor progress.", icon: CheckCircle, color: "text-gold", bg: "bg-gold/10" }
                ] as const).map(r => (
                  <button key={r.id} onClick={() => handleRoleSelect(r.id)} 
                    className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border hover:border-primary/50 bg-card hover:bg-muted/20 transition-all text-left group shadow-sm">
                    <div className={`w-14 h-14 rounded-2xl ${r.bg} flex items-center justify-center ${r.color} group-hover:scale-110 transition-transform`}>
                      <r.icon className="h-7 w-7" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground text-lg">{r.label}</div>
                      <div className="text-sm text-muted-foreground leading-snug">{r.sub}</div>
                    </div>
                  </button>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Already have an account? <button className="text-primary font-bold hover:underline" onClick={() => { setMode("login"); setView("form"); }}>Sign In</button>
              </p>
            </motion.div>
          ) : view === "choice" ? (
            /* ── VIEW 2: AUTH CHOICE ── */
            <motion.div key="choice" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md">
              <button onClick={() => setView("role-selection")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Back to roles
              </button>
              <h1 className="text-3xl font-display font-bold text-foreground mb-2 capitalize">{role} Account</h1>
              <p className="text-muted-foreground mb-10">How would you like to continue?</p>
              
              <div className="space-y-4">
                <Button variant="hero" className="w-full h-14 text-lg" onClick={() => { setMode("signup"); setView("form"); }}>Create New Account</Button>
                <Button variant="outline" className="w-full h-14 text-lg" onClick={() => { setMode("login"); setView("form"); }}>Sign In to Existing</Button>
              </div>
            </motion.div>
          ) : (
            /* ── VIEW 3: AUTH FORM ── */
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full max-w-md">
              <h1 className="text-3xl font-display font-bold text-foreground mb-2">{currentViewTitle()}</h1>
              <p className="text-muted-foreground mb-8">
                {mode === "login" ? "Welcome back! Enter your details." : "Join the platform and start your journey."}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                {mode === "signup" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="John Doe" className={`h-12 border-2 ${errors.name ? 'border-destructive' : 'focus:border-primary transition-all'}`} value={name} onChange={e => setName(e.target.value)} required />
                    {errors.name && <p className="text-xs text-destructive font-medium">{errors.name}</p>}
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className={`h-12 border-2 ${errors.email ? 'border-destructive' : 'focus:border-primary transition-all'}`} value={email} onChange={e => setEmail(e.target.value)} required />
                  {errors.email && <p className="text-xs text-destructive font-medium">{errors.email}</p>}
                </div>
                {mode !== "forgot" && (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="password">Password</Label>
                      {mode === "login" && (
                        <button type="button" className="text-xs text-primary font-bold hover:underline" onClick={() => setMode("forgot")}>Forgot?</button>
                      )}
                    </div>
                    <Input id="password" type="password" placeholder="••••••••" className={`h-12 border-2 ${errors.password ? 'border-destructive' : 'focus:border-primary transition-all'}`} value={password} onChange={e => setPassword(e.target.value)} required minLength={mode === "signup" ? 8 : 1} />
                    {errors.password && <p className="text-xs text-destructive font-medium">{errors.password}</p>}
                  </div>
                )}
                <Button type="submit" variant="hero" className="w-full h-12 text-base" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                  {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  {!submitting && mode !== "forgot" && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
              
              <div className="mt-8 text-center space-y-4">
                <p className="text-sm text-muted-foreground">
                  {mode === "login" ? "New to Even Playground? " : "Already have an account? "}
                  <button className="text-primary font-bold hover:underline" onClick={() => {
                    if (mode === "login") { setMode("signup"); setView("role-selection"); }
                    else { setMode("login"); setView("form"); }
                  }}>
                    {mode === "login" ? "Sign Up" : "Sign In instead"}
                  </button>
                </p>
                {mode === "forgot" && (
                   <button className="text-sm text-muted-foreground hover:text-foreground font-medium" onClick={() => { setMode("login"); setView("form"); }}>Cancel</button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;
