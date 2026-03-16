import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Building2, Trophy, ArrowRight, Loader2, Link } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";

type UserRole = "athlete" | "institution" | "fan";

const SignupWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [saving, setSaving] = useState(false);
  
  // Profile Data
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  
  // Role Specific Data
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");

  useEffect(() => {
    // If not logged in, they shouldn't be here
    if (!user) {
      navigate("/login");
    } else {
      // Set initial name from auth metadata
      const metaName = user.user_metadata?.name || user.user_metadata?.full_name;
      if (metaName) setName(metaName);
    }
  }, [user, navigate]);

  const handleCompleteSetup = async () => {
    if (!user || !role) return;
    setSaving(true);
    
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ name, bio, role })
        .eq("id", user.id);
        
      if (profileError) throw profileError;

      // 2. Create Role-Specific Record
      if (role === "athlete") {
        await supabase.from("athletes").insert([{
          profile_id: user.id,
          sport: sport || "General",
          position: position || "Player"
        }]);
      } else if (role === "institution") {
        await supabase.from("institutions").insert([{
          profile_id: user.id,
          institution_name: name
        }]);
      }

      toast({ title: "Setup Complete", description: "Welcome to Even Playground!" });
      
      // Navigate to dashboard
      if (role === "athlete") navigate("/dashboard/athlete");
      else if (role === "institution") navigate("/dashboard/institution");
      else navigate("/buzz");
      
    } catch (error: any) {
      toast({ title: "Setup Failed", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO title="Complete Your Profile | Even Playground" />
      
      <div className="w-full max-w-lg">
        {/* Progress Bar */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full">
            <div 
              className="h-full bg-primary transition-all duration-500 rounded-full" 
              style={{ width: `${((step - 1) / 2) * 100}%` }} 
            />
          </div>
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-semibold border-2 transition-colors ${
                s <= step ? "bg-primary border-primary text-primary-foreground" : "bg-card border-border text-muted-foreground"
              }`}
            >
              {s}
            </div>
          ))}
        </div>

        <motion.div 
          className="bg-card rounded-2xl border border-border shadow-elevated overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-8">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Choose your path</h2>
                    <p className="text-muted-foreground mt-1">How will you use Even Playground?</p>
                  </div>
                  
                  <div className="space-y-3">
                    <button
                      onClick={() => setRole("athlete")}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        role === "athlete" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-energy/10 flex items-center justify-center text-energy">
                        <Trophy className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Athlete</div>
                        <div className="text-sm text-muted-foreground">Track stats, build your profile, get scouted.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setRole("institution")}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        role === "institution" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-stat-blue/10 flex items-center justify-center text-stat-blue">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Institution / Club</div>
                        <div className="text-sm text-muted-foreground">Manage teams, verify matches, scout talent.</div>
                      </div>
                    </button>

                    <button
                      onClick={() => setRole("fan")}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                        role === "fan" ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                        <User className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">Fan / Supporter</div>
                        <div className="text-sm text-muted-foreground">Follow athletes, engage with the community.</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Basic Info</h2>
                    <p className="text-muted-foreground mt-1">Let the community know who you are.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Display Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="bio">Bio (Optional)</Label>
                      <Input id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="A quick summary about you" className="mt-1" />
                    </div>
                  </div>
                </motion.div>
              )}

              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Almost there</h2>
                    <p className="text-muted-foreground mt-1">
                      {role === "athlete" ? "Tell us about your game." : "Finalizing your setup."}
                    </p>
                  </div>

                  {role === "athlete" ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="sport">Primary Sport</Label>
                        <Input id="sport" value={sport} onChange={(e) => setSport(e.target.value)} placeholder="e.g. Football" className="mt-1" />
                      </div>
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input id="position" value={position} onChange={(e) => setPosition(e.target.value)} placeholder="e.g. Striker" className="mt-1" />
                      </div>
                    </div>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <Link className="mx-auto h-12 w-12 text-primary opacity-50 mb-4" />
                      <p>Your profile is ready to be created.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              <Button 
                variant="ghost" 
                onClick={() => setStep(step - 1)}
                disabled={step === 1 || saving}
              >
                Back
              </Button>
              <Button 
                variant="hero" 
                onClick={() => {
                  if (step < 3) setStep(step + 1);
                  else handleCompleteSetup();
                }}
                disabled={(!role && step === 1) || saving || (step === 2 && !name)}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {step === 3 ? "Complete Setup" : "Next"} 
                {!saving && step !== 3 && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupWizard;
