import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Save, Loader2, Plus, Trash2, Building2, CalendarDays, ChevronDown, ChevronUp, Upload, Shield } from "lucide-react";
import FileUpload from "@/components/FileUpload";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { handleQueryError } from "@/lib/queryHelpers";
import { MultiSelectSport } from "@/components/MultiSelectSport";

/** Insert a notification row for a target user. Fire-and-forget. */
async function sendNotification({
  userId, type, title, body, data,
}: {
  userId: string;
  type: string;
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}) {
  try {
    const { error } = await supabase.from("notifications" as any).insert([{
      user_id: userId,
      type,
      title,
      body: body ?? null,
      data: data ?? {},
    }]);
    if (error) console.warn("[sendNotification] failed:", error.message);
  } catch (e) {
    console.warn("[sendNotification] exception:", e);
  }
}

interface ClubHistoryEntry {
  id?: string;
  club_name: string;
  institution_id?: string | null;
  start_date: string;
  end_date: string;
  notes: string;
}

/** Return the current club (no end_date) from a sorted history list */
const getCurrentClub = (history: ClubHistoryEntry[]): ClubHistoryEntry | null =>
  history.find(c => !c.end_date) || null;

const AthleteProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [athlete, setAthlete] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  // Profile fields
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [sports, setSports] = useState<string[]>(["Football"]);
  const [position, setPosition] = useState("");
  const [province, setProvince] = useState("");
  const [nationality, setNationality] = useState("");
  const [dob, setDob] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [playingStyle, setPlayingStyle] = useState("");
  const [mysafaId, setMysafaId] = useState("");

  // Club History
  const [clubHistory, setClubHistory] = useState<ClubHistoryEntry[]>([]);
  const [savingClub, setSavingClub] = useState(false);
  const [showClubForm, setShowClubForm] = useState(false);
  const [newClub, setNewClub] = useState<ClubHistoryEntry>({ club_name: "", institution_id: null, start_date: "", end_date: "", notes: "" });
  const [institutions, setInstitutions] = useState<{ id: string; institution_name: string }[]>([]);
  const [institutionSearch, setInstitutionSearch] = useState("");
  const [showInstitutionDropdown, setShowInstitutionDropdown] = useState(false);

  // Invites
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);

  const currentClub = getCurrentClub(clubHistory);

  /** Sync athletes.squad and athletes.institution_id with the current club */
  const syncSquad = async (athleteId: string, clubName: string | null, institutionId: string | null = null) => {
    await supabase
      .from("athletes")
      .update({ squad: clubName, institution_id: institutionId })
      .eq("id", athleteId);
  };

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [{ data: profileData }, { data: athleteData }, { data: institutionsData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("athletes").select("*").eq("profile_id", user.id).maybeSingle(),
        supabase.from("institutions").select("id, institution_name").order("institution_name"),
      ]);
      if (institutionsData) {
        setInstitutions(institutionsData);
      }
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || "");
        setBio(profileData.bio || "");
      }
      if (athleteData) {
        setAthlete(athleteData);
        // Build merged sports: primary + secondary_sports
        const primarySport = athleteData.sport || "Football";
        const secondary = athleteData.secondary_sports || [];
        const allSports = [primarySport, ...secondary.filter((s: string) => s !== primarySport)];
        setSports(allSports);
        setPosition(athleteData.position || "");
        setProvince(athleteData.province || "");
        setNationality(athleteData.nationality || "");
        setDob(athleteData.date_of_birth || "");
        setHeightCm(athleteData.height_cm != null ? String(athleteData.height_cm) : "");
        setWeightKg(athleteData.weight_kg != null ? String(athleteData.weight_kg) : "");
        setPlayingStyle(athleteData.playing_style || "");
        setMysafaId(athleteData.mysafa_id || "");

        // Load club history
        const { data: clubs } = await supabase
          .from("club_history" as any)
          .select("*, institutions(institution_name)")
          .eq("athlete_id", athleteData.id)
          .order("start_date", { ascending: false });
        const history = (clubs || []) as unknown as any[];

        // Seed: if athlete has a squad value but no club history, create an initial entry
        if (history.length === 0 && athleteData.squad) {
          const { data: seeded, error: seedErr } = await supabase
            .from("club_history" as any)
            .insert([{
              athlete_id: athleteData.id,
              club_name: athleteData.squad,
              start_date: athleteData.created_at ? new Date(athleteData.created_at).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
            }])
            .select()
            .single();
          if (!seedErr && seeded) {
            history.push(seeded as unknown as ClubHistoryEntry);
          }
        }

        setClubHistory(history);
        
        // Load pending invites
        const { data: invitesData } = await supabase
          .from("athlete_invites")
          .select(`
            id, status, created_at,
            profiles!invited_by (
              name,
              institutions (id, institution_name)
            )
          `)
          .eq("athlete_id", athleteData.id)
          .eq("status", "pending");
          
        setPendingInvites((invitesData as any) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleAddClub = async () => {
    if (!newClub.club_name || !newClub.start_date || !athlete) return;
    setSavingClub(true);

    try {
      // If adding a current club (no end_date), close the existing current club
      const isNewCurrent = !newClub.end_date;
      if (isNewCurrent && currentClub?.id) {
        const closeDate = newClub.start_date;
        await supabase
          .from("club_history" as any)
          .update({ end_date: closeDate })
          .eq("id", currentClub.id);
        // Update local state for the closed entry
        setClubHistory(prev =>
          prev.map(c => c.id === currentClub.id ? { ...c, end_date: closeDate } : c)
        );
      }

      const { data, error } = await supabase
        .from("club_history" as any)
        .insert([{ ...newClub, end_date: newClub.end_date || null, athlete_id: athlete.id }])
        .select()
        .single();

      if (error) {
        handleQueryError(error, "Failed to add club.");
      } else {
        const updated = [data as unknown as ClubHistoryEntry, ...clubHistory.map(c =>
          c.id === currentClub?.id && isNewCurrent ? { ...c, end_date: newClub.start_date } : c
        )];
        setClubHistory(updated);
        setNewClub({ club_name: "", institution_id: null, start_date: "", end_date: "", notes: "" });
        setInstitutionSearch("");
        setShowClubForm(false);
        toast({ title: "Club added!" });

        // Sync squad with new current club
        const newCurrentClub = getCurrentClub(updated);
        await syncSquad(athlete.id, newCurrentClub?.club_name || null, newCurrentClub?.institution_id || null);
      }
    } catch (err: any) {
      handleQueryError(err, "Failed to add club.");
    } finally {
      setSavingClub(false);
    }
  };

  const handleAcceptInvite = async (inviteId: string, institutionId: string, instName: string) => {
    if (!athlete) return;
    setSaving(true);
    try {
      // Fetch the invite to get invited_by (the institution user id)
      const { data: inviteRowData } = await supabase
        .from("athlete_invites")
        .select("invited_by")
        .eq("id", inviteId)
        .maybeSingle();

      const inviteRow = inviteRowData as any;

      const { error: invErr } = await supabase.from("athlete_invites" as any).update({ status: "used" }).eq("id", inviteId);
      if (invErr) throw invErr;
      
      const { error: athErr } = await supabase.from("athletes").update({ institution_id: institutionId }).eq("id", athlete.id);
      if (athErr) throw athErr;

      toast({ title: "Invitation accepted!", description: `You are now linked to ${instName}.` });
      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));
      
      // Auto add to club history
      const newClubEntry = {
        club_name: instName,
        institution_id: institutionId,
        start_date: new Date().toISOString().slice(0, 10),
        notes: "Joined via invitation",
        athlete_id: athlete.id
      };
      const { data: addedClub } = await supabase.from("club_history" as any).insert([newClubEntry]).select().single();
      
      if (addedClub) {
        setClubHistory([addedClub as unknown as ClubHistoryEntry, ...clubHistory]);
        await syncSquad(athlete.id, instName, institutionId);
      }

      // Notify the institution user
      if (inviteRow?.invited_by) {
        await sendNotification({
          userId: inviteRow.invited_by,
          type: "invite_accepted",
          title: `${profile?.name ?? "An athlete"} accepted your invitation`,
          body: `They are now linked to your roster as a member of ${instName}.`,
          data: { athlete_id: athlete.id, institution_id: institutionId },
        });
      }
    } catch (err) {
      handleQueryError(err, "Failed to accept invite.");
    } finally {
      setSaving(false);
    }
  };

  const handleRejectInvite = async (inviteId: string) => {
    setSaving(true);
    try {
      // Fetch the invite to get invited_by before deleting
      const { data: inviteRowData } = await supabase
        .from("athlete_invites")
        .select("invited_by, athletes(institution_id), profiles!invited_by(institutions(institution_name))")
        .eq("id", inviteId)
        .maybeSingle();

      const inviteRow = inviteRowData as any;

      const { error } = await supabase.from("athlete_invites" as any).delete().eq("id", inviteId);
      if (error) throw error;
      toast({ title: "Invitation declined" });
      setPendingInvites(prev => prev.filter(inv => inv.id !== inviteId));

      // Notify the institution user
      if (inviteRow?.invited_by) {
        const instArray = (inviteRow as any)?.profiles?.institutions;
        const inst = Array.isArray(instArray) ? instArray[0] : instArray;
        await sendNotification({
          userId: inviteRow.invited_by,
          type: "invite_declined",
          title: `${profile?.name ?? "An athlete"} declined your invitation`,
          body: inst?.institution_name ? `They chose not to join ${inst.institution_name} at this time.` : undefined,
          data: { invite_id: inviteId },
        });
      }
    } catch (err) {
      handleQueryError(err, "Failed to decline invite.");
    } finally {
      setSaving(false);
    }
  };

  const handleLeaveClub = async (clubId: string, instId: string | null) => {
    if (!athlete) return;
    setSaving(true);
    try {
      const endDate = new Date().toISOString().slice(0, 10);
      const { error: clubErr } = await supabase.from("club_history" as any).update({ end_date: endDate }).eq("id", clubId);
      if (clubErr) throw clubErr;
      
      if (instId && athlete.institution_id === instId) {
        const { error: athErr } = await supabase.from("athletes").update({ institution_id: null, squad: null }).eq("id", athlete.id);
        if (athErr) throw athErr;
        setAthlete({ ...athlete, institution_id: null, squad: null });
      }
      
      toast({ title: "Left club", description: "You have formally left the club." });
      const updated = clubHistory.map(c => c.id === clubId ? { ...c, end_date: endDate } : c);
      setClubHistory(updated);
    } catch (err) {
      handleQueryError(err, "Failed to leave club.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClub = async (id: string) => {
    if (!athlete) return;
    const { error } = await supabase.from("club_history" as any).delete().eq("id", id);
    if (error) {
      handleQueryError(error);
    } else {
      const updated = clubHistory.filter(c => c.id !== id);
      setClubHistory(updated);
      // Sync squad after deletion
      const newCurrentClub = getCurrentClub(updated);
      await syncSquad(athlete.id, newCurrentClub?.club_name || null, newCurrentClub?.institution_id || null);
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      // 1. Update Profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          bio: bio.trim(),
        })
        .eq("id", user.id);

      if (profileError) throw profileError;

      // 2. Upsert Athlete — squad is derived from club history, use current club
      const primarySport = sports[0] || "General";
      const secondarySports = sports.length > 1 ? sports.slice(1) : [];
      const { error: athleteError } = await supabase
        .from("athletes")
        .upsert({
          profile_id: user.id,
          full_name: name.trim() || null,
          sport: primarySport,
          secondary_sports: secondarySports,
          position: position || "Player",
          province: province || null,
          nationality: nationality || null,
          date_of_birth: dob || null,
          height_cm: heightCm ? parseFloat(heightCm) : null,
          weight_kg: weightKg ? parseFloat(weightKg) : null,
          playing_style: playingStyle || null,
          mysafa_id: mysafaId || null,
          squad: currentClub?.club_name || null,
        }, { onConflict: "profile_id" });

      if (athleteError) throw athleteError;

      toast({ title: "Profile saved!", description: "Your changes have been successfully updated." });

      if (!athlete) {
        const { data: newAthlete } = await supabase.from("athletes").select("*").eq("profile_id", user.id).maybeSingle();
        if (newAthlete) setAthlete(newAthlete);
      }
    } catch (error: any) {
      console.error("[AthleteProfile] Save error:", error);
      toast({ title: "Save failed", description: error.message || "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your basic info, bio, and career history.</p>
        </div>

        {/* Basic Info Card */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card space-y-4">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" /> Basic Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Full Name</Label>
              <Input className="mt-1" value={name} onChange={e => setName(e.target.value)} placeholder="Your full name" />
            </div>
            <div>
              <Label>Date of Birth</Label>
              <Input className="mt-1" type="date" value={dob} onChange={e => setDob(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>Sports <span className="text-[10px] font-normal text-muted-foreground ml-1">(First selected = Primary)</span></Label>
              <div className="mt-2">
                <MultiSelectSport selected={sports} onChange={setSports} />
              </div>
            </div>
            <div>
              <Label>Position</Label>
              <Input className="mt-1" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Striker" />
            </div>
            <div>
              <Label>Nationality</Label>
              <Input className="mt-1" value={nationality} onChange={e => setNationality(e.target.value)} placeholder="e.g. South African" />
            </div>
            <div>
              <Label>Province</Label>
              <Input className="mt-1" value={province} onChange={e => setProvince(e.target.value)} placeholder="e.g. Gauteng" />
            </div>
            <div>
              <Label>Height (cm)</Label>
              <Input className="mt-1" type="number" value={heightCm} onChange={e => setHeightCm(e.target.value)} placeholder="e.g. 180" />
            </div>
            <div>
              <Label>Weight (kg)</Label>
              <Input className="mt-1" type="number" value={weightKg} onChange={e => setWeightKg(e.target.value)} placeholder="e.g. 75" />
            </div>
            <div className="md:col-span-2">
              <Label>Playing Style</Label>
              <Input className="mt-1" value={playingStyle} onChange={e => setPlayingStyle(e.target.value)} placeholder="e.g. Box-to-box midfielder" />
            </div>
          </div>

          <h3 className="font-display font-semibold text-foreground text-sm pt-2 flex items-center gap-2">
            <Shield className="h-3.5 w-3.5 text-primary" /> Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>MYSAFA ID</Label>
              <Input className="mt-1" value={mysafaId} onChange={e => setMysafaId(e.target.value)} placeholder="Your SAFA registered ID" />
            </div>
            <div>
              <Label>Current Club</Label>
              <div className="mt-1 flex items-center h-10 px-3 rounded-md border border-border bg-muted/40 text-sm">
                {currentClub ? (
                  <span className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-primary" />
                    {currentClub.club_name}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Add a club below with no end date</span>
                )}
              </div>
            </div>
          </div>

          <div>
            <Label>Biography</Label>
            <Textarea
              className="mt-1 resize-none"
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              placeholder="Write a short bio about your career, style of play, and goals..."
            />
          </div>
          <Button onClick={handleSave} disabled={saving} variant="hero" className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>

        {/* Pending Invites */}
        {pendingInvites.length > 0 && (
          <div className="bg-card rounded-xl p-6 border border-amber-500/30 shadow-card bg-amber-500/5 space-y-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Shield className="h-4 w-4 text-amber-500" /> Pending Invitations
            </h2>
            <div className="space-y-3">
              {pendingInvites.map(inv => {
                const instArray = inv.profiles?.institutions;
                const inst = Array.isArray(instArray) ? instArray[0] : instArray;
                if (!inst) return null;
                return (
                  <div key={inv.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-background">
                    <div>
                      <div className="font-semibold text-sm">{inst.institution_name}</div>
                      <div className="text-xs text-muted-foreground">Invited by {inv.profiles?.name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleRejectInvite(inv.id)} disabled={saving}>Decline</Button>
                      <Button variant="default" size="sm" onClick={() => handleAcceptInvite(inv.id, inst.id, inst.institution_name)} disabled={saving}>Accept</Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Club History Card */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" /> Club History
            </h2>
            <Button variant="outline" size="sm" onClick={() => setShowClubForm(!showClubForm)}>
              {showClubForm ? <ChevronUp className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
              {showClubForm ? "Cancel" : "Add Club"}
            </Button>
          </div>

          <AnimatePresence>
            {showClubForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4 p-4 rounded-lg bg-muted/30 border border-border">
                  <div className="md:col-span-2 relative">
                    <Label>Club Name</Label>
                    <Input 
                      className="mt-1" 
                      value={institutionSearch || newClub.club_name} 
                      onChange={e => {
                        setInstitutionSearch(e.target.value);
                        setNewClub({ ...newClub, club_name: e.target.value, institution_id: null });
                        setShowInstitutionDropdown(true);
                      }} 
                      onFocus={() => setShowInstitutionDropdown(true)}
                      onBlur={() => setTimeout(() => setShowInstitutionDropdown(false), 200)}
                      placeholder="e.g. Kaizer Chiefs FC" 
                    />
                    {showInstitutionDropdown && institutionSearch && institutions.filter(i => i.institution_name.toLowerCase().includes(institutionSearch.toLowerCase())).length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-48 overflow-y-auto">
                        {institutions
                          .filter(i => i.institution_name.toLowerCase().includes(institutionSearch.toLowerCase()))
                          .map(inst => (
                            <div 
                              key={inst.id} 
                              className="px-3 py-2 text-sm cursor-pointer hover:bg-muted"
                              onClick={() => {
                                setNewClub({ ...newClub, club_name: inst.institution_name, institution_id: inst.id });
                                setInstitutionSearch(inst.institution_name);
                                setShowInstitutionDropdown(false);
                              }}
                            >
                              {inst.institution_name}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                  <div>
                    <Label>Start Date</Label>
                    <Input className="mt-1" type="date" value={newClub.start_date} onChange={e => setNewClub({ ...newClub, start_date: e.target.value })} />
                  </div>
                  <div>
                    <Label>End Date (leave blank if current)</Label>
                    <Input className="mt-1" type="date" value={newClub.end_date} onChange={e => setNewClub({ ...newClub, end_date: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Notes</Label>
                    <Input className="mt-1" value={newClub.notes} onChange={e => setNewClub({ ...newClub, notes: e.target.value })} placeholder="e.g. Key achievement or role" />
                  </div>
                  {!newClub.end_date && currentClub && (
                    <p className="md:col-span-2 text-xs text-muted-foreground">
                      This will close your current stint at <strong>{currentClub.club_name}</strong> on the start date above.
                    </p>
                  )}
                  <Button className="md:col-span-2" onClick={handleAddClub} disabled={savingClub || !newClub.club_name || !newClub.start_date}>
                    {savingClub ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                    Add to History
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {clubHistory.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-sm text-muted-foreground">No club history yet. Add your first club above.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {clubHistory.map((club, i) => (
                <motion.div
                  key={club.id || i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border bg-background ${!club.end_date ? "border-primary/40 bg-primary/5" : "border-border"}`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${!club.end_date ? "bg-primary/20" : "bg-primary/10"}`}>
                    <Building2 className={`h-4 w-4 ${!club.end_date ? "text-primary" : "text-primary"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground flex items-center gap-2">
                      {club.club_name}
                      {(club as any).institutions?.institution_name && (
                        <span className="flex items-center gap-1 text-[10px] text-stat-blue font-medium bg-stat-blue/10 px-1.5 py-0.5 rounded-full">
                          <Shield className="h-2.5 w-2.5" /> Verified
                        </span>
                      )}
                      {!club.end_date && (
                        <span className="text-[10px] font-medium bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">Current</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(club.start_date).getFullYear()} – {club.end_date ? new Date(club.end_date).getFullYear() : "Present"}
                    </div>
                    {club.notes && <div className="text-xs text-muted-foreground mt-1">{club.notes}</div>}
                  </div>
                  <div className="flex items-center gap-1">
                    {!club.end_date && (
                      <Button variant="outline" size="sm" className="h-7 text-[10px] px-2 text-muted-foreground hover:text-foreground" onClick={() => club.id && handleLeaveClub(club.id, club.institution_id)}>
                        Leave
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => club.id && handleDeleteClub(club.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Document Upload Card */}
        <div className="bg-card rounded-xl p-6 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground flex items-center gap-2 mb-4">
            <Upload className="h-4 w-4 text-primary" /> Documents & Media
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Upload certificates, ID documents, performance reports, or photos for your profile.
          </p>
          <FileUpload
            maxFiles={10}
            maxSizeMB={10}
            folder="profile-docs"
            onUploadComplete={(files) => {
            }}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteProfilePage;
