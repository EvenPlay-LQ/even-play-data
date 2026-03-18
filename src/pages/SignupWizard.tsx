import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Trophy, ArrowRight, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { SPORT_OPTIONS } from "@/config/constants";

type UserRole = "athlete" | "institution" | "fan";

const SignupWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);

  // Profile data
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");

  // Athlete-specific
  const [sport, setSport] = useState("Football");
  const [position, setPosition] = useState("");

  // Institution-specific
  const [institutionName, setInstitutionName] = useState("");
  const [province, setProvince] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const metaName = user.user_metadata?.name || user.user_metadata?.full_name;
    if (metaName) setName(metaName);

    // Auto-fill role from metadata if set during signup
    const metaRole = user.user_metadata?.user_type as UserRole | undefined;
    if (metaRole && ["athlete", "institution", "fan"].includes(metaRole)) {
      setRole(metaRole);
    }
  }, [user, navigate]);

  const handleCompleteSetup = async () => {
    if (!user || !role) {
      toast({ title: "Error", description: "Missing user or role information.", variant: "destructive" });
      return;
    }
    
    if (!name.trim()) {
      toast({ title: "Error", description: "Name is required.", variant: "destructive" });
      setStep(2);
      return;
    }

    setSaving(true);

    try {
      console.log("[SignupWizard] Starting setup for role:", role);

      // 1. Upsert the profile row (trigger may have already created it, but we update with wizard info)
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          name: name.trim(),
          bio: bio.trim() || null,
          user_type: role,
          updated_at: new Date().toISOString(),
        }, { onConflict: "id" });

      if (profileError) {
        console.error("[SignupWizard] Profile upsert error:", profileError);
        throw profileError;
      }

      // 2. Create role-specific record
      if (role === "athlete") {
        const { error: athleteErr } = await supabase.from("athletes").upsert({
          profile_id: user.id,
          sport: sport || "General",
          position: position || "Player",
        }, { onConflict: "profile_id" });
        
        if (athleteErr) {
          console.error("[SignupWizard] Athlete upsert error:", athleteErr);
          throw athleteErr;
        }
      } else if (role === "institution") {
        const { error: instErr } = await supabase.from("institutions").upsert({
          profile_id: user.id,
          institution_name: institutionName || name,
          province: province || null,
        }, { onConflict: "profile_id" });

        if (instErr) {
          console.error("[SignupWizard] Institution upsert error:", instErr);
          throw instErr;
        }
      }

      toast({ title: "Welcome to Even Playground! 🎉", description: "Your profile is ready." });

      // Clean redirect based on role
      setTimeout(() => {
        if (role === "athlete") navigate("/dashboard/athlete");
        else if (role === "institution") navigate("/dashboard/institution");
        else navigate("/buzz");
      }, 500);

    } catch (error: any) {
      console.error("[SignupWizard] Setup error:", error);
      toast({
        title: "Setup Failed",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const totalSteps = 3;
  const progress = ((step - 1) / (totalSteps - 1)) * 100;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO title="Complete Your Profile | Even Playground" />

      <div className="w-full max-w-lg">
        {/* Progress indicator */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full">
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {[1, 2, 3].map((s) => (
            <div key={s}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold border-2 transition-all ${
                s < step ? "bg-primary border-primary text-primary-foreground" :
                s === step ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg" :
                "bg-card border-border text-muted-foreground"
              }`}>
              {s < step ? <CheckCircle className="h-5 w-5" /> : s}
            </div>
          ))}
        </div>

        <motion.div className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="p-8">
            <AnimatePresence mode="wait">

              {/* ── Step 1: Choose Role ── */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Choose your path</h2>
                    <p className="text-muted-foreground mt-1">How will you use Even Playground?</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { value: "athlete", label: "Athlete", sub: "Track stats, build your profile, get scouted.", Icon: Trophy, color: "text-energy", bg: "bg-energy/10" },
                      { value: "institution", label: "Institution / Club", sub: "Manage teams, verify matches, scout talent.", Icon: Building2, color: "text-stat-blue", bg: "bg-stat-blue/10" },
                      { value: "fan", label: "Fan / Supporter", sub: "Follow athletes, engage with the community.", Icon: User, color: "text-gold", bg: "bg-gold/10" },
                    ].map(({ value, label, sub, Icon, color, bg }) => (
                      <button key={value} onClick={() => setRole(value as UserRole)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${role === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center ${color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="font-semibold text-foreground">{label}</div>
                          <div className="text-sm text-muted-foreground">{sub}</div>
                        </div>
                        {role === value && <CheckCircle className="ml-auto h-5 w-5 text-primary" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Step 2: Basic Info ── */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">
                      {role === "institution" ? "About your institution" : "Basic Info"}
                    </h2>
                    <p className="text-muted-foreground mt-1">Let the community know who you are.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">{role === "institution" ? "Your Name" : "Display Name"}</Label>
                      <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="John Doe" className="mt-1" />
                    </div>
                    {role === "institution" && (
                      <div>
                        <Label htmlFor="institutionName">Institution / Club Name</Label>
                        <Input id="institutionName" value={institutionName} onChange={e => setInstitutionName(e.target.value)} placeholder="e.g. Premier FC Academy" className="mt-1" />
                      </div>
                    )}
                    {role === "institution" && (
                      <div>
                        <Label htmlFor="city">Province / Region</Label>
                        <Input id="city" value={city} onChange={e => setCity(e.target.value)} placeholder="e.g. Gauteng" className="mt-1" />
                      </div>
                    )}
                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Textarea id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="A quick summary about you" className="mt-1 resize-none" rows={3} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* ── Step 3: Role-specific ── */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Almost there</h2>
                    <p className="text-muted-foreground mt-1">
                      {role === "athlete" ? "Tell us about your game." : "Your profile is ready to be created."}
                    </p>
                  </div>
                  {role === "athlete" ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sport">Primary Sport</Label>
                        <select id="sport" value={sport} onChange={e => setSport(e.target.value)}
                          className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm">
                          {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Striker" className="mt-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center">
                      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="h-8 w-8 text-primary" />
                      </div>
                      <p className="text-foreground font-semibold">All set!</p>
                      <p className="text-muted-foreground text-sm mt-1">Click "Complete Setup" to create your profile.</p>
                    </div>
                  )}
                </motion.div>
              )}

            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              <Button variant="ghost" onClick={() => setStep(step - 1)} disabled={step === 1 || saving}>
                Back
              </Button>
              <Button variant="hero"
                onClick={() => { if (step < totalSteps) setStep(step + 1); else handleCompleteSetup(); }}
                disabled={(!role && step === 1) || (step === 2 && !name.trim()) || saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {step === totalSteps ? "Complete Setup" : "Next"}
                {!saving && step !== totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupWizard;
