import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Save, Loader2, Plus, Trash2, Building2, CalendarDays, ChevronDown, ChevronUp } from "lucide-react";
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
import { SPORT_OPTIONS } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

interface ClubHistoryEntry {
  id?: string;
  club_name: string;
  start_date: string;
  end_date: string;
  notes: string;
}

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
  const [sport, setSport] = useState("");
  const [position, setPosition] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("");
  const [currentClub, setCurrentClub] = useState("");
  const [dob, setDob] = useState("");

  // Club History
  const [clubHistory, setClubHistory] = useState<ClubHistoryEntry[]>([]);
  const [savingClub, setSavingClub] = useState(false);
  const [showClubForm, setShowClubForm] = useState(false);
  const [newClub, setNewClub] = useState<ClubHistoryEntry>({ club_name: "", start_date: "", end_date: "", notes: "" });

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [{ data: profileData }, { data: athleteData }] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase.from("athletes").select("*").eq("profile_id", user.id).maybeSingle(),
      ]);
      if (profileData) {
        setProfile(profileData);
        setName(profileData.name || "");
        setBio(profileData.bio || "");
      }
      if (athleteData) {
        setAthlete(athleteData);
        setSport(athleteData.sport || "");
        setPosition(athleteData.position || "");
        setProvince(athleteData.province || "");
        setCountry(athleteData.country || "");
        setDob(athleteData.date_of_birth || "");

        // Load club history from custom table
        const { data: clubs } = await supabase
          .from("club_history" as any)
          .select("*")
          .eq("athlete_id", athleteData.id)
          .order("start_date", { ascending: false });
        setClubHistory((clubs || []) as unknown as ClubHistoryEntry[]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const handleSave = async () => {
    if (!athlete || !profile) return;
    setSaving(true);
    const [profileResult, athleteResult] = await Promise.all([
      supabase.from("profiles").update({ name, bio } as any).eq("id", user!.id),
      supabase.from("athletes").update({ sport, position, province, country, date_of_birth: dob || null } as any).eq("id", athlete.id),
    ]);
    if (profileResult.error) handleQueryError(profileResult.error, "Failed to update profile.");
    else if (athleteResult.error) handleQueryError(athleteResult.error, "Failed to update athlete info.");
    else toast({ title: "Profile saved!", description: "Your changes have been saved." });
    setSaving(false);
  };

  const handleAddClub = async () => {
    if (!newClub.club_name || !newClub.start_date || !athlete) return;
    setSavingClub(true);
    const { data, error } = await supabase
      .from("club_history" as any)
      .insert([{ ...newClub, athlete_id: athlete.id }])
      .select()
      .single();
    if (error) { handleQueryError(error, "Failed to add club."); }
    else {
      setClubHistory([data as ClubHistoryEntry, ...clubHistory]);
      setNewClub({ club_name: "", start_date: "", end_date: "", notes: "" });
      setShowClubForm(false);
      toast({ title: "Club added!" });
    }
    setSavingClub(false);
  };

  const handleDeleteClub = async (id: string) => {
    const { error } = await supabase.from("club_history" as any).delete().eq("id", id);
    if (error) handleQueryError(error);
    else setClubHistory(clubHistory.filter(c => c.id !== id));
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
            <div>
              <Label>Sport</Label>
              <Select value={sport} onValueChange={setSport}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select sport" /></SelectTrigger>
                <SelectContent>
                  {SPORT_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Position</Label>
              <Input className="mt-1" value={position} onChange={e => setPosition(e.target.value)} placeholder="e.g. Striker" />
            </div>
            <div>
              <Label>Province</Label>
              <Input className="mt-1" value={province} onChange={e => setProvince(e.target.value)} placeholder="e.g. Gauteng" />
            </div>
            <div>
              <Label>Country</Label>
              <Input className="mt-1" value={country} onChange={e => setCountry(e.target.value)} placeholder="e.g. South Africa" />
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
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Profile
          </Button>
        </div>

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
                  <div className="md:col-span-2">
                    <Label>Club Name</Label>
                    <Input className="mt-1" value={newClub.club_name} onChange={e => setNewClub({ ...newClub, club_name: e.target.value })} placeholder="e.g. Kaizer Chiefs FC" />
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
                  className="flex items-start gap-3 p-3 rounded-lg border border-border bg-background"
                >
                  <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-foreground">{club.club_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(club.start_date).getFullYear()} – {club.end_date ? new Date(club.end_date).getFullYear() : "Present"}
                    </div>
                    {club.notes && <div className="text-xs text-muted-foreground mt-1">{club.notes}</div>}
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => club.id && handleDeleteClub(club.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteProfilePage;
