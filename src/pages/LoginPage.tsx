import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, ArrowRight, User, Building2, Loader2, Mail, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { loginSchema, signupSchema, forgotPasswordSchema } from "@/lib/validations";

type AuthMode = "login" | "signup" | "forgot" | "verify";
type UserRole = "athlete" | "institution";

const LoginPage = () => {
  const [mode, setMode] = useState<AuthMode>("login");
  const [role, setRole] = useState<UserRole>("athlete");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

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
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Check your email", description: "We've sent a password reset link." });
        setMode("login");
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
        // If email already confirmed (dev mode with confirm disabled)
        if (error.message?.includes("already registered")) {
          toast({ title: "Email already registered", description: "Try signing in instead.", variant: "destructive" });
        } else {
          toast({ title: "Signup failed", description: error.message, variant: "destructive" });
        }
      } else {
        // Show verification screen — user must check email
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
      // Check if user has completed onboarding (has a profile with role)
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        const { data: profile } = await supabase.from("profiles")
          .select("user_type, name")
          .eq("id", currentUser.id)
          .maybeSingle();

        // If no profile or missing critical info, go to setup
        if (!profile || !profile.name || !profile.user_type) {
          navigate("/setup");
          return;
        }

        // Role-based routing
        switch (profile.user_type) {
          case "institution":
            navigate("/dashboard/institution");
            break;
          case "athlete":
            navigate("/dashboard/athlete");
            break;
          case "fan":
            navigate("/buzz");
            break;
          default:
            navigate("/setup");
        }
      } else {
        navigate("/");
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left decorative panel */}
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
          <h2 className="text-3xl font-display font-bold text-primary-foreground mb-4">Your sports career starts here</h2>
          <p className="text-primary-foreground/60">Track performance, verify stats, discover talent — all in one platform.</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-12 bg-background">
        <AnimatePresence mode="wait">
          {/* ── EMAIL VERIFY SCREEN ── */}
          {mode === "verify" ? (
            <motion.div key="verify" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-md text-center">
              <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Mail className="h-10 w-10 text-primary" />
              </div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-3">Check your email</h1>
              <p className="text-muted-foreground mb-2">
                We sent a confirmation link to:
              </p>
              <p className="font-semibold text-foreground mb-6">{email}</p>
              <div className="bg-muted/40 rounded-xl p-4 text-sm text-muted-foreground mb-6 space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-stat-green flex-shrink-0" />
                  <span>Click the link in the email to verify your account</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-stat-green flex-shrink-0" />
                  <span>You'll be redirected back to sign in</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-stat-green flex-shrink-0" />
                  <span>Check your spam folder if not in inbox</span>
                </div>
              </div>
              <Button variant="outline" className="w-full" onClick={() => setMode("login")}>
                Back to Sign In
              </Button>
              <button className="mt-3 text-xs text-muted-foreground hover:text-primary transition-colors"
                onClick={async () => {
                  await supabase.auth.resend({ type: "signup", email });
                  toast({ title: "Email resent!", description: "Check your inbox again." });
                }}>
                Didn't receive it? Resend email
              </button>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
              className="w-full max-w-md">
              <div className="flex items-center gap-2 mb-8 lg:hidden">
                <Zap className="h-6 w-6 text-primary" />
                <span className="font-display font-bold text-xl text-foreground">Even Playground</span>
              </div>

              <h1 className="text-2xl font-display font-bold text-foreground mb-2">
                {mode === "login" ? "Welcome back" : mode === "signup" ? "Create your account" : "Reset password"}
              </h1>
              <p className="text-muted-foreground mb-8">
                {mode === "login" ? "Sign in to continue" : mode === "signup" ? "Join the platform" : "Enter your email to receive a reset link"}
              </p>

              {/* Role selector (signup only) */}
              {mode === "signup" && (
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {([
                    { value: "athlete", label: "Athlete", sub: "Track performance", Icon: User },
                    { value: "institution", label: "Institution", sub: "Manage teams", Icon: Building2 },
                  ] as const).map(({ value, label, sub, Icon }) => (
                    <button key={value} type="button" onClick={() => setRole(value)}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${role === value ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"}`}>
                      <Icon className={`h-5 w-5 ${role === value ? "text-primary" : "text-muted-foreground"}`} />
                      <div className="text-left">
                        <div className={`text-sm font-semibold ${role === value ? "text-foreground" : "text-muted-foreground"}`}>{label}</div>
                        <div className="text-xs text-muted-foreground">{sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {mode === "signup" && (
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" placeholder="Your name" className="mt-1.5" value={name} onChange={e => setName(e.target.value)} required />
                    {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="you@example.com" className="mt-1.5" value={email} onChange={e => setEmail(e.target.value)} required />
                  {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                </div>
                {mode !== "forgot" && (
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" type="password" placeholder="••••••••" className="mt-1.5" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                    {errors.password && <p className="text-xs text-destructive mt-1">{errors.password}</p>}
                  </div>
                )}
                {mode === "login" && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-primary hover:underline" onClick={() => setMode("forgot")}>
                      Forgot password?
                    </button>
                  </div>
                )}
                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={submitting}>
                  {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {mode === "login" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Link"}
                  {!submitting && mode !== "forgot" && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {mode === "forgot" ? (
                  <button type="button" className="text-primary font-medium hover:underline" onClick={() => setMode("login")}>
                    Back to Sign In
                  </button>
                ) : (
                  <>
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button type="button" className="text-primary font-medium hover:underline"
                      onClick={() => setMode(mode === "login" ? "signup" : "login")}>
                      {mode === "login" ? "Sign Up" : "Sign In"}
                    </button>
                  </>
                )}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default LoginPage;
