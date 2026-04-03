import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Building2, Trophy, ArrowRight, Loader2, CheckCircle,
  Plus, Users, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SEO } from "@/components/SEO";
import { SPORT_OPTIONS } from "@/config/constants";
import ConsentStep from "@/components/ConsentStep";

type UserRole = "athlete" | "institution" | "fan";

// Athlete wizard: 5 steps → Role, BasicInfo, SportsProfile, Credentials, Consent
// Institution wizard: 5 steps → Role, ContactInfo, InstitutionDetails, Registrations, Consent
// Parent wizard: 4 steps → Role, BasicInfo, ChildProfile, Consent

const STEPS: Record<UserRole, string[]> = {
  athlete: ["Choose Role", "Basic Info", "Sports Profile", "Your ID / Credentials", "Privacy & Consent"],
  institution: ["Choose Role", "Contact Info", "Institution Details", "Privacy & Consent"],
  fan: ["Choose Role", "Your Info", "Child Profile", "Privacy & Consent"],
};

const totalStepsFor = (role: UserRole | null) => (role ? STEPS[role].length : 3);

const SignupWizard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshProfile } = useProfile();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState<UserRole | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [saving, setSaving] = useState(false);
  const [consented, setConsented] = useState(false);

  // ─── Shared ─────────────────────────────────────────────────────────────
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [nationality, setNationality] = useState("");

  // ─── Athlete ─────────────────────────────────────────────────────────────
  const [sport, setSport] = useState("Football");
  const [position, setPosition] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [playingStyle, setPlayingStyle] = useState("");
  const [mysafaId, setMysafaId] = useState("");
  const [squad, setSquad] = useState("");

  // ─── Institution ─────────────────────────────────────────────────────────
  const [contactPhone, setContactPhone] = useState("");
  const [institutionName, setInstitutionName] = useState("");
  const [institutionType, setInstitutionType] = useState("club");
  const [province, setProvince] = useState("");
  const [physicalAddress, setPhysicalAddress] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [safaAffiliation, setSafaAffiliation] = useState("");
  const [sasaRegistration, setSasaRegistration] = useState("");

  // ─── Parent ───────────────────────────────────────────────────────────────
  const [parentPhone, setParentPhone] = useState("");
  const [relationship, setRelationship] = useState("parent");

  // ─── Child (for parent wizard step 3) ─────────────────────────────────────
  const [childName, setChildName] = useState("");
  const [childDob, setChildDob] = useState("");
  const [childSport, setChildSport] = useState("Football");
  const [childPosition, setChildPosition] = useState("");

  // ─── Institution Add Athlete modal fields ──────────────────────────────────
  const [ath_name, setAthName] = useState("");
  const [ath_sport, setAthSport] = useState("Football");
  const [ath_position, setAthPosition] = useState("");
  const [ath_dob, setAthDob] = useState("");
  const [showAddAthlete, setShowAddAthlete] = useState(false);
  const [addingAthlete, setAddingAthlete] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }
    const metaName = user.user_metadata?.name || user.user_metadata?.full_name;
    if (metaName) setName(metaName);

    const metaRole = user.user_metadata?.user_type as UserRole | undefined;
    if (metaRole && ["athlete", "institution", "fan"].includes(metaRole) && !initialized) {
      setRole(metaRole);
      setStep(2);
      setInitialized(true);
    } else if (!initialized) {
      setInitialized(true);
    }
  }, [user, navigate, initialized]);

  const totalSteps = totalStepsFor(role);
  const progress = totalSteps > 1 ? ((step - 1) / (totalSteps - 1)) * 100 : 0;
  const stepLabels = role ? STEPS[role] : ["Choose Role", "Info", "Complete"];

  // ─── Step validation ──────────────────────────────────────────────────────
  const canProceed = () => {
    if (step === 1) return !!role;
    if (!role) return false;

    if (role === "athlete") {
      if (step === 2) return name.trim().length > 0 && dateOfBirth.length > 0;
      if (step === 3) return sport.length > 0 && position.trim().length > 0;
      if (step === 4) return true; // credentials optional
      if (step === 5) return consented;
    }
    if (role === "institution") {
      if (step === 2) return name.trim().length > 0;
      if (step === 3) return institutionName.trim().length > 0 && province.trim().length > 0;
      if (step === 4) return consented;
    }
    if (role === "fan") {
      if (step === 2) return name.trim().length > 0;
      if (step === 3) return childName.trim().length > 0; // child name required
      if (step === 4) return consented;
    }
    return true;
  };

  // ─── Institution: Add First Athlete ───────────────────────────────────────
  const handleAddInstitutionAthlete = async () => {
    if (!user || !ath_name.trim()) return;
    
    setAddingAthlete(true);
    
    try {
      // Create stub athlete record
      const { data: athlete, error: athleteError } = await supabase.from("athletes").insert({
        full_name: ath_name.trim(),
        sport: ath_sport,
        position: ath_position || "Player",
        date_of_birth: ath_dob || null,
        status: "stub"
      }).select("id").single();

      if (athleteError) throw athleteError;

      toast({
        title: "Athlete Added! 🎉",
        description: `${ath_name} has been added to your institution.`,
      });

      // Close modal and navigate to dashboard
      setShowAddAthlete(false);
      navigate("/dashboard/institution");
    } catch (error: any) {
      console.error("[SignupWizard] Add athlete error:", error);
      toast({
        title: "Error Adding Athlete",
        description: error?.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAddingAthlete(false);
    }
  };

  // ─── Submit ───────────────────────────────────────────────────────────────
  const handleCompleteSetup = async () => {
    if (!user || !role) return;
    setSaving(true);

    try {
      // 1. Upsert profile with POPIA consent + setup_complete
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: user.id,
        name: name.trim(),
        bio: bio.trim() || null,
        user_type: role,
        setup_complete: true,
        popia_consent: true,
        popia_consent_date: new Date().toISOString(),
        popia_consent_version: "1.0",
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
      if (profileError) throw profileError;

      // 2. Role-specific records
      if (role === "athlete") {
        // T2 Split: Use RPC to find/create an athlete record and claim it
        const { data: claimData, error: claimErr } = await (supabase.rpc as any)("find_or_create_athlete", {
          p_full_name: name.trim(),
          p_date_of_birth: dateOfBirth || null,
          p_sport: sport || "Football",
          p_email: user.email || null,
          p_position: position || null,
        });

        if (claimErr) throw claimErr;

        // Update the claimed athlete with additional wizard details
        const athleteId = (claimData as any)?.athlete_id;
        if (athleteId) {
          const { error: updateErr } = await supabase.from("athletes").update({
            profile_id: user.id,
            status: "claimed",
            position: position || "Player",
            squad: squad || null,
            nationality: nationality || null,
            height_cm: heightCm ? parseFloat(heightCm) : null,
            weight_kg: weightKg ? parseFloat(weightKg) : null,
            mysafa_id: mysafaId || null,
            playing_style: playingStyle || null,
          }).eq("id", athleteId);
          
          if (updateErr) throw updateErr;
        }

      } else if (role === "institution") {
        const { data: instData, error: instErr } = await supabase.from("institutions").upsert({
          profile_id: user.id,
          institution_name: institutionName || name,
          physical_address: physicalAddress || null,
          institution_type: institutionType,
          safa_affiliation_number: safaAffiliation || null,
          sasa_registration_number: sasaRegistration || null,
          province: province || null,
          website_url: websiteUrl || null,
          contact_phone: contactPhone || null,
        }, { onConflict: "profile_id" } as any).select("id").single();
        if (instErr) throw instErr;
        // Institution will be redirected to buzz page with other users

      } else if (role === "fan") {
        // Create parent record
        const { error: parentErr } = await supabase.from("parents" as any).upsert({
          profile_id: user.id,
          contact_phone: parentPhone || null,
          relationship_to_child: relationship || "parent",
        }, { onConflict: "profile_id" } as any);
        if (parentErr) throw parentErr;

        // T2 Split: Create stub athlete record for child (no shadow profile required)
        if (childName.trim()) {
          const { data: childAthlete, error: childAthleteErr } = await supabase.from("athletes").insert({
            full_name: childName.trim(),
            sport: childSport || "Football",
            position: childPosition || "Player",
            date_of_birth: childDob || null,
            status: "stub"
          } as any).select("id").single();

          if (!childAthleteErr && childAthlete) {
            // Link via parent_athletes junction (Standardized name)
            const { data: pData } = await supabase.from("parents" as any).select("id").eq("profile_id", user.id).single();
            if (pData) {
              await supabase.from("parent_athletes" as any).insert({
                parent_id: (pData as any).id,
                athlete_id: childAthlete.id,
                relationship: relationship,
              });
            }
          }
        }
      }

      toast({ title: "Welcome to Even Playground! 🎉", description: "Your profile is ready." });

      // Force refresh the profile to ensure setup_complete is synced
      await refreshProfile();
      
      // Redirect all users to community dashboard (Buzz page) after signup
      setTimeout(() => {
        navigate("/buzz", { replace: true });
      }, 400);
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

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <SEO title="Complete Your Profile | Even Playground" />

      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center mb-8">
          <span className="font-display font-bold text-2xl text-foreground">Even Playground</span>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-8 relative">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border -z-10 rounded-full">
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${progress}%` }} />
          </div>
          {stepLabels.map((label, i) => {
            const s = i + 1;
            return (
              <div key={s} className="flex flex-col items-center gap-1">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-semibold border-2 transition-all text-sm ${
                  s < step ? "bg-primary border-primary text-primary-foreground" :
                  s === step ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg" :
                  "bg-card border-border text-muted-foreground"
                }`}>
                  {s < step ? <CheckCircle className="h-4 w-4" /> : s}
                </div>
                <span className={`text-[10px] hidden sm:block font-medium text-center ${s === step ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
              </div>
            );
          })}
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
                    <p className="text-muted-foreground mt-1 text-sm">How will you use Even Playground?</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { value: "athlete", label: "Athlete", sub: "Track stats, build your profile, get scouted.", Icon: Trophy, color: "text-energy", bg: "bg-energy/10" },
                      { value: "institution", label: "Institution / Club", sub: "Manage teams, verify matches, scout talent.", Icon: Building2, color: "text-stat-blue", bg: "bg-stat-blue/10" },
                      { value: "fan", label: "Parent / Guardian", sub: "Create and monitor your child's athletic profile.", Icon: Users, color: "text-gold", bg: "bg-gold/10" },
                    ].map(({ value, label, sub, Icon, color, bg }) => (
                      <button key={value} onClick={() => setRole(value as UserRole)}
                        className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${role === value ? "border-primary bg-primary/5" : "border-border hover:border-primary/30"}`}>
                        <div className={`w-12 h-12 rounded-full ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-foreground">{label}</div>
                          <div className="text-[11px] text-muted-foreground leading-tight">{sub}</div>
                        </div>
                        {role === value && <CheckCircle className="ml-auto h-5 w-5 text-primary flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ─────────── ATHLETE STEPS ─────────── */}

              {/* Athlete Step 2: Basic Info */}
              {step === 2 && role === "athlete" && (
                <motion.div key="a-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Basic Info</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Tell us a bit about yourself.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Label>Display Name *</Label>
                      <Input className="mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
                    </div>
                    <div>
                      <Label>Date of Birth *</Label>
                      <Input type="date" className="mt-1" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} />
                    </div>
                    <div>
                      <Label>Nationality</Label>
                      <Input className="mt-1" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. South African" />
                    </div>
                    <div className="col-span-2">
                      <Label>Bio (Optional)</Label>
                      <Textarea className="mt-1 resize-none" rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="A quick summary about you" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Athlete Step 3: Sports Profile */}
              {step === 3 && role === "athlete" && (
                <motion.div key="a-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Sports Profile</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Your performance details.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Primary Sport *</Label>
                      <select value={sport} onChange={e => setSport(e.target.value)} className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm">
                        {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <Label>Position *</Label>
                      <Input className="mt-1" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Striker" />
                    </div>
                    <div>
                      <Label>Height (cm)</Label>
                      <Input type="number" className="mt-1" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="180" />
                    </div>
                    <div>
                      <Label>Weight (kg)</Label>
                      <Input type="number" className="mt-1" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="75" />
                    </div>
                    <div className="col-span-2">
                      <Label>Playing Style</Label>
                      <Input className="mt-1" value={playingStyle} onChange={e => setPlayingStyle(e.target.value)} placeholder="e.g. Box-to-box midfielder" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Athlete Step 4: Credentials */}
              {step === 4 && role === "athlete" && (
                <motion.div key="a-step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Your Credentials</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Link your federation IDs (optional).</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>MYSAFA ID</Label>
                      <Input className="mt-1" value={mysafaId} onChange={e => setMysafaId(e.target.value)} placeholder="Your SAFA registered ID" />
                    </div>
                    <div>
                      <Label>Current Squad / Team</Label>
                      <Input className="mt-1" value={squad} onChange={e => setSquad(e.target.value)} placeholder="e.g. Kaizer Chiefs U19" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">You can update these later in your profile settings.</p>
                </motion.div>
              )}

              {/* Athlete Step 5: Consent */}
              {step === 5 && role === "athlete" && (
                <ConsentStep role="athlete" onConsent={setConsented} />
              )}

              {/* ─────────── INSTITUTION STEPS ─────────── */}

              {/* Institution Step 2: Contact Info */}
              {step === 2 && role === "institution" && (
                <motion.div key="i-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Contact Info</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Who is the primary contact for this account?</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Your Name (Admin) *</Label>
                      <Input className="mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. John Doe" />
                    </div>
                    <div>
                      <Label>Contact Phone Number</Label>
                      <Input type="tel" className="mt-1" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+27..." />
                    </div>
                    <div>
                      <Label>Bio (Optional)</Label>
                      <Textarea className="mt-1 resize-none" rows={2} value={bio} onChange={e => setBio(e.target.value)} placeholder="Brief description of your institution" />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Institution Step 3: Institution Details */}
              {step === 3 && role === "institution" && (
                <motion.div key="i-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Institution Details</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Tell us about your club or school.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Institution / Club Name *</Label>
                      <Input className="mt-1" value={institutionName} onChange={e => setInstitutionName(e.target.value)} placeholder="e.g. Premier FC Academy" />
                    </div>
                    <div>
                      <Label>Institution Type</Label>
                      <select value={institutionType} onChange={e => setInstitutionType(e.target.value)} className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm">
                        <option value="club">Club</option>
                        <option value="school">School</option>
                        <option value="academy">Academy</option>
                        <option value="federation">Federation</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Province *</Label>
                        <Input className="mt-1" value={province} onChange={e => setProvince(e.target.value)} placeholder="e.g. Gauteng" />
                      </div>
                      <div>
                        <Label>Physical Address</Label>
                        <Input className="mt-1" value={physicalAddress} onChange={e => setPhysicalAddress(e.target.value)} placeholder="e.g. 123 Main St, Johannesburg" />
                      </div>
                    </div>
                    <div>
                      <Label>Website URL</Label>
                      <Input className="mt-1" value={websiteUrl} onChange={e => setWebsiteUrl(e.target.value)} placeholder="https://..." />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Institution Step 4: Consent */}
              {step === 4 && role === "institution" && (
                <ConsentStep role="institution" onConsent={setConsented} />
              )}

              {/* ─────────── PARENT STEPS ─────────── */}

              {/* Parent Step 2: Basic Info */}
              {step === 2 && role === "fan" && (
                <motion.div key="p-step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Your Info</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Tell us a little about yourself.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Your Full Name *</Label>
                      <Input className="mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Jane Smith" />
                    </div>
                    <div>
                      <Label>Contact Phone</Label>
                      <Input type="tel" className="mt-1" value={parentPhone} onChange={e => setParentPhone(e.target.value)} placeholder="+27..." />
                    </div>
                    <div>
                      <Label>Your Relationship to Child</Label>
                      <select value={relationship} onChange={e => setRelationship(e.target.value)} className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm">
                        <option value="parent">Parent</option>
                        <option value="guardian">Legal Guardian</option>
                        <option value="sibling">Sibling</option>
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Parent Step 3: Child Profile */}
              {step === 3 && role === "fan" && (
                <motion.div key="p-step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-foreground">Link or Create Profile</h2>
                    <p className="text-muted-foreground mt-1 text-sm">Create an athlete profile for your child or link to an existing institution record.</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <Label>Child's Full Name *</Label>
                      <Input className="mt-1" value={childName} onChange={e => setChildName(e.target.value)} placeholder="e.g. James Smith" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Date of Birth</Label>
                        <Input type="date" className="mt-1" value={childDob} onChange={e => setChildDob(e.target.value)} />
                      </div>
                      <div>
                        <Label>Primary Sport</Label>
                        <select value={childSport} onChange={e => setChildSport(e.target.value)} className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm">
                          {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label>Position</Label>
                      <Input className="mt-1" value={childPosition} onChange={e => setChildPosition(e.target.value)} placeholder="e.g. Midfielder" />
                    </div>
                    <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-xl border border-border">
                      <User className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">A profile will be created and linked to your account. Your child can claim it later with their own email.</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Parent Step 4: Consent */}
              {step === 4 && role === "fan" && (
                <ConsentStep role="fan" onConsent={setConsented} />
              )}

            </AnimatePresence>

            {/* Navigation */}
            <div className="mt-8 pt-6 border-t border-border flex justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(step - 1)}
                disabled={step === 1 || (step === 2 && !!user?.user_metadata?.user_type) || saving}
              >
                Back
              </Button>
              <Button
                variant="hero"
                onClick={() => {
                  if (step < totalSteps) setStep(step + 1);
                  else handleCompleteSetup();
                }}
                disabled={!canProceed() || saving}
              >
                {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                {step === totalSteps ? "Complete Setup" : "Next"}
                {!saving && step !== totalSteps && <ArrowRight className="w-4 h-4 ml-2" />}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Institution: Add First Athlete Modal */}
      <Dialog open={showAddAthlete} onOpenChange={(open) => {
        if (!open) {
          setShowAddAthlete(false);
          navigate("/dashboard/institution");
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Add Your First Athlete
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground mb-4">
            Create athlete profiles for players in your institution. You can add as many as you need.
          </p>
          <div className="space-y-4">
            <div>
              <Label>Athlete Name *</Label>
              <Input className="mt-1" value={ath_name} onChange={e => setAthName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Sport</Label>
                <select value={ath_sport} onChange={e => setAthSport(e.target.value)} className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm">
                  {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <Label>Position</Label>
                <Input className="mt-1" value={ath_position} onChange={e => setAthPosition(e.target.value)} placeholder="e.g. Striker" />
              </div>
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input type="date" className="mt-1" value={ath_dob} onChange={e => setAthDob(e.target.value)} />
            </div>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={handleAddInstitutionAthlete} disabled={addingAthlete || !ath_name.trim()}>
                {addingAthlete ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                Add Athlete
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/institution")}>
                Go to Dashboard
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SignupWizard;
