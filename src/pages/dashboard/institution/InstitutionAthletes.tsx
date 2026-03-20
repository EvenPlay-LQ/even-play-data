import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Search, Users, Zap, Plus, Star, Image, Loader2, Info, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs, TabsContent, TabsList, TabsTrigger,
} from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { getLevelName, SPORT_OPTIONS } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

interface NewAthleteForm {
  name: string;
  email: string;
  sport: string;
  position: string;
}

const InstitutionAthletes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [institution, setInstitution] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Create Athlete Dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newAthlete, setNewAthlete] = useState<NewAthleteForm>({ name: "", email: "", sport: "Football", position: "" });

  // Coach Feedback Dialog
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<any>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(4);
  const [feedbackCategory, setFeedbackCategory] = useState("General");

  // Media Upload Dialog
  const [mediaOpen, setMediaOpen] = useState(false);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaDescription, setMediaDescription] = useState("");

  useEffect(() => {
    if (!user) return;
    loadAthletes();
  }, [user]);

  const loadAthletes = async () => {
    setLoading(true);
    const { data: inst } = await supabase.from("institutions").select("id").eq("profile_id", user!.id).maybeSingle();
    if (inst) {
      setInstitution(inst);
      const { data, error } = await supabase.from("athletes")
        .select("*, profiles(name, avatar)")
        .eq("institution_id", inst.id)
        .order("performance_score", { ascending: false });
      if (error) handleQueryError(error);
      else setAthletes(data || []);
    }
    setLoading(false);
  };

  const handleCreateAthlete = async () => {
    if (!newAthlete.name || !newAthlete.email || !institution) return;
    setSaving(true);

    // 1. Invite user via email (creates a Supabase auth user)
    const { data: signUpData, error: authError } = await supabase.auth.admin?.inviteUserByEmail?.(newAthlete.email) || { data: null, error: null };

    // If no admin API, create profile manually (check if profile with email exists)
    // 2. Create Profile row (shadow profile)
    const profileId = crypto.randomUUID();
    const { error: profileErr } = await supabase.from("profiles")
      .insert([{ 
        id: profileId, 
        name: newAthlete.name, 
        user_type: "athlete" 
      } as any]);

    if (profileErr) { handleQueryError(profileErr, "Failed to create athlete profile."); setSaving(false); return; }

    // 3. Create User Role (manual since trigger won't fly without auth.users)
    const { error: roleErr } = await supabase.from("user_roles" as any).insert([{
      user_id: profileId,
      role: "athlete"
    }]);
    
    if (roleErr) { handleQueryError(roleErr, "Failed to assign athlete role."); }

    // 4. Create Athlete record linked to institution
    const { data: athleteData, error: athleteErr } = await supabase.from("athletes").insert([{
      profile_id: profileId,
      institution_id: institution.id,
      sport: newAthlete.sport,
      position: newAthlete.position,
    }]).select("*, profiles(name, avatar)").single();

    if (athleteErr) { handleQueryError(athleteErr, "Failed to create athlete record."); }
    else {
      setAthletes([athleteData, ...athletes]);
      setNewAthlete({ name: "", email: "", sport: "Football", position: "" });
      setCreateOpen(false);
      toast({ title: "Athlete profile created!", description: `${newAthlete.name} has been added to your roster.` });
    }
    setSaving(false);
  };

  const handleAddFeedback = async () => {
    if (!selectedAthlete || !feedbackText || !institution) return;
    setSaving(true);
    const { error } = await supabase.from("coach_feedback" as any).insert([{
      athlete_id: selectedAthlete.id,
      institution_id: institution.id,
      feedback_text: feedbackText,
      rating: feedbackRating,
      category: feedbackCategory,
    }]);
    if (error) { handleQueryError(error); }
    else {
      setFeedbackOpen(false);
      setFeedbackText("");
      setFeedbackRating(4);
      setFeedbackCategory("General");
      toast({ title: "Feedback submitted!", description: `Feedback for ${selectedAthlete.profiles?.name} has been saved.` });
    }
    setSaving(false);
  };

  const handleUploadMedia = async () => {
    if (!mediaFile || !selectedAthlete) return;
    setUploading(true);
    const ext = mediaFile.name.split(".").pop();
    const path = `athlete_media/${selectedAthlete.id}/${Date.now()}.${ext}`;
    const mediaType = mediaFile.type.startsWith("video") ? "video" : "image";

    const { error: uploadError } = await supabase.storage.from("athlete_media").upload(path, mediaFile);
    if (uploadError) { handleQueryError(uploadError, "Upload failed."); setUploading(false); return; }

    const { data: { publicUrl } } = supabase.storage.from("athlete_media").getPublicUrl(path);
    const { error: insertError } = await supabase.from("media_gallery" as any).insert([{
      athlete_id: selectedAthlete.id,
      media_type: mediaType,
      file_url: publicUrl,
      description: mediaDescription,
    }]);

    if (insertError) handleQueryError(insertError);
    else {
      setMediaOpen(false);
      setMediaFile(null);
      setMediaDescription("");
      toast({ title: "Media uploaded!", description: "Visible in the athlete's gallery." });
    }
    setUploading(false);
  };

  const filtered = athletes.filter(a =>
    !search.trim() || (a.profiles?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Athletes Roster</h1>
            <p className="text-sm text-muted-foreground">Manage and interact with your registered athletes.</p>
          </div>

          {/* Create Athlete Dialog */}
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-1" /> Add Athlete</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Create Athlete Profile</DialogTitle></DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>Full Name</Label>
                  <Input className="mt-1" placeholder="John Doe" value={newAthlete.name} onChange={e => setNewAthlete({ ...newAthlete, name: e.target.value })} />
                </div>
                <div>
                  <Label>Email (for invitation)</Label>
                  <Input className="mt-1" type="email" placeholder="athlete@example.com" value={newAthlete.email} onChange={e => setNewAthlete({ ...newAthlete, email: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Sport</Label>
                    <select className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
                      value={newAthlete.sport} onChange={e => setNewAthlete({ ...newAthlete, sport: e.target.value })}>
                      {SPORT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <Label>Position</Label>
                    <Input className="mt-1" placeholder="e.g. Striker" value={newAthlete.position} onChange={e => setNewAthlete({ ...newAthlete, position: e.target.value })} />
                  </div>
                </div>
                <Button className="w-full" onClick={handleCreateAthlete} disabled={saving || !newAthlete.name || !newAthlete.email}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                  Create Athlete Profile
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search athletes..." className="pl-10" value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Athlete List */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">{search ? "No athletes match your search." : "No athletes yet. Add your first athlete above."}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ath, i) => (
              <motion.div key={ath.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-semibold text-sm text-primary">
                    {(ath.profiles?.name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground truncate">{ath.profiles?.name || "Unknown"}</h3>
                  <p className="text-xs text-muted-foreground">{ath.sport} · {ath.position}</p>
                </div>
                <div className="text-right mr-2">
                  <div className="text-base font-display font-bold text-foreground">{Number(ath.performance_score).toFixed(0)}</div>
                  <div className="flex items-center gap-1 justify-end">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground">{getLevelName(ath.level)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/profile?id=${ath.profile_id}`)}>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  {/* Media Upload */}
                  <Dialog open={mediaOpen && selectedAthlete?.id === ath.id} onOpenChange={(o) => { setMediaOpen(o); if (o) setSelectedAthlete(ath); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Upload media">
                        <Image className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Upload Media for {ath.profiles?.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-2">
                        <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" onChange={e => setMediaFile(e.target.files?.[0] || null)} />
                        <button onClick={() => fileRef.current?.click()}
                          className="w-full h-28 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors text-sm">
                          {mediaFile ? `✓ ${mediaFile.name}` : "Click to choose image or video"}
                        </button>
                        <div>
                          <Label>Description</Label>
                          <Input className="mt-1" placeholder="Caption..." value={mediaDescription} onChange={e => setMediaDescription(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleUploadMedia} disabled={!mediaFile || uploading}>
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Upload
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  {/* Coach Feedback */}
                  <Dialog open={feedbackOpen && selectedAthlete?.id === ath.id} onOpenChange={(o) => { setFeedbackOpen(o); if (o) setSelectedAthlete(ath); }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="icon" className="h-8 w-8" title="Leave feedback">
                        <Star className="h-3.5 w-3.5" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader><DialogTitle>Coach Feedback for {ath.profiles?.name}</DialogTitle></DialogHeader>
                      <div className="space-y-4 pt-2">
                        <div>
                          <Label>Feedback Category</Label>
                          <select
                            className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
                            value={feedbackCategory}
                            onChange={e => setFeedbackCategory(e.target.value)}
                          >
                            {["General", "Technical Skills", "Tactical Awareness", "Physical Conditioning", "Mental & Attitude"].map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <Label>Session Rating (1–5)</Label>
                          <div className="flex gap-2 mt-2">
                            {([1, 2, 3, 4, 5] as const).map(r => {
                              const labels: Record<number, string> = { 1: "Poor", 2: "Below Avg", 3: "Average", 4: "Good", 5: "Excellent" };
                              return (
                                <button key={r} onClick={() => setFeedbackRating(r)} title={labels[r]}
                                  className={`w-10 h-10 rounded-full border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-0.5 ${
                                    r <= feedbackRating ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground"
                                  }`}>
                                  {r}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
                            <Info className="h-3 w-3" />
                            {({ 1: "Poor", 2: "Below Average", 3: "Average", 4: "Good", 5: "Excellent" } as Record<number,string>)[feedbackRating]} session
                          </p>
                        </div>
                        <div>
                          <Label>Coaching Notes</Label>
                          <Textarea className="mt-1 resize-none" rows={4} placeholder="e.g. Strong pressing in first half, needs to improve positional awareness in defence..." value={feedbackText} onChange={e => setFeedbackText(e.target.value)} />
                        </div>
                        <Button className="w-full" onClick={handleAddFeedback} disabled={saving || !feedbackText}>
                          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null} Submit Feedback
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Hidden dialogs to avoid duplicate Dialogs */}
        <Dialog open={false} onOpenChange={() => {}}><DialogContent></DialogContent></Dialog>
      </div>
    </DashboardLayout>
  );
};

export default InstitutionAthletes;
