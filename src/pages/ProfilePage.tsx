import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Star, Calendar, Heart, MessageCircle, Users, Settings,
  LogOut, Moon, Globe, LayoutDashboard, ChevronRight, Bot, Award, Edit,
  Trophy, TrendingUp, Image as ImageIcon, Video, Calendar as CalendarIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { SPORT_OPTIONS } from "@/config/constants";
import { profileSchema } from "@/lib/validations";
import { handleQueryError } from "@/lib/queryHelpers";
import { Skeleton } from "@/components/ui/skeleton";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const targetId = searchParams.get("id");
  const { signOut, user: authUser } = useAuth();
  const { profile: ownProfile, primaryRole: ownRole, loading: loadingOwn, updateProfile } = useProfile();
  const { toast } = useToast();
  
  const [viewProfile, setViewProfile] = useState<any>(null);
  const [viewRole, setViewRole] = useState<string>("");
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const [fetchingProfile, setFetchingProfile] = useState(true);

  const [activeTab, setActiveTab] = useState<"activity" | "favorites">("activity");
  const [postCount, setPostCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSport, setEditSport] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  // Athlete Data
  const [athlete, setAthlete] = useState<any>(null);
  const [matches, setMatches] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [highlights, setHighlights] = useState<any[]>([]);
  const [loadingAthlete, setLoadingAthlete] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      setFetchingProfile(true);
      const effectiveId = targetId || authUser?.id;
      if (!effectiveId) return;

      setIsOwnProfile(effectiveId === authUser?.id);

      // Fetch Profile Details
      const { data: pData, error: pErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", effectiveId)
        .single();

      if (pData && !pErr) {
        setViewProfile(pData);
        setViewRole(pData.user_type);
        
        // Fetch Stats
        const [{ count: posts }, { count: likes }] = await Promise.all([
          supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", effectiveId),
          supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", effectiveId),
        ]);
        setPostCount(posts || 0);
        setLikeCount(likes || 0);
      }
      setFetchingProfile(false);
    };
    loadProfile();
  }, [targetId, authUser]);

  useEffect(() => {
    if (!viewProfile || viewRole !== "athlete") return;

    const fetchAthleteData = async () => {
      setLoadingAthlete(true);
      const { data: athleteData } = await supabase
        .from("athletes")
        .select("*")
        .eq("profile_id", viewProfile.id)
        .maybeSingle();

      if (athleteData) {
        setAthlete(athleteData);
        const [mRes, pmRes, aRes, hRes] = await Promise.all([
          supabase.from("athlete_matches" as any).select("*").eq("athlete_id", athleteData.id).order("match_date", { ascending: false }).limit(5),
          supabase.from("performance_metrics" as any).select("*").eq("athlete_id", athleteData.id).order("recorded_at", { ascending: false }).limit(1),
          supabase.from("achievements" as any).select("*").eq("athlete_id", athleteData.id).order("date_earned", { ascending: false }),
          supabase.from("media_gallery" as any).select("*").eq("athlete_id", athleteData.id).order("created_at", { ascending: false }).limit(6),
        ]);

        if (!mRes.error) setMatches(mRes.data || []);
        if (!pmRes.error) setMetrics(pmRes.data || []);
        if (!aRes.error) setAchievements(aRes.data || []);
        if (!hRes.error) setHighlights(hRes.data || []);
      }
      setLoadingAthlete(false);
    };

    fetchAthleteData();
  }, [viewProfile, viewRole]);

  const openEditDialog = () => {
    setEditName(viewProfile?.name || "");
    setEditBio(viewProfile?.bio || "");
    setEditSport(viewProfile?.favorite_sport || "");
    setFormErrors({});
    setShowEdit(true);
  };

  const handleSaveProfile = async () => {
    setFormErrors({});
    const result = profileSchema.safeParse({ name: editName, bio: editBio, favorite_sport: editSport });
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { errs[i.path[0] as string] = i.message; });
      setFormErrors(errs);
      return;
    }
    setSaving(true);
    const { error } = await updateProfile({ name: editName.trim(), bio: editBio.trim(), favorite_sport: editSport });
    if (error) {
      handleQueryError(error, "Failed to update profile.");
    } else {
      toast({ title: "Profile updated!" });
      setShowEdit(false);
      setViewProfile({ ...viewProfile, name: editName, bio: editBio, favorite_sport: editSport });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardPath = ownRole === "institution"
    ? "/dashboard/institution"
    : ownRole === "athlete"
      ? "/dashboard/athlete"
      : null;

  if (fetchingProfile || loadingOwn) {
    return (
      <AppLayout>
        <div className="space-y-6 max-w-2xl">
          <Skeleton className="h-32 rounded-2xl w-full" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </div>
          <Skeleton className="h-40 rounded-xl w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!viewProfile) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <p className="text-muted-foreground">Profile not found.</p>
          <Button variant="link" onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-2xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 border border-border shadow-card"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              {viewProfile?.avatar ? (
                <img src={viewProfile.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="font-display font-bold text-2xl text-primary">
                  {(viewProfile?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-foreground">{viewProfile?.name || "User"}</h1>
              <p className="text-sm text-muted-foreground capitalize">{viewRole} · {viewProfile?.favorite_sport || "Sports"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Member since {viewProfile?.created_at ? new Date(viewProfile.created_at).toLocaleDateString("en", { month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            {isOwnProfile && (
              <Button variant="ghost" size="icon" onClick={openEditDialog}>
                <Edit className="h-4 w-4" />
              </Button>
            )}
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10">
              <Star className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold">{viewProfile?.reputation || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Shortcut (Only own profile) */}
        {isOwnProfile && dashboardPath && (
          <Button variant="outline" className="w-full justify-between h-12 rounded-xl" onClick={() => navigate(dashboardPath)}>
            <span className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Go to {ownRole === "institution" ? "Institution" : "Athlete"} Dashboard
            </span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}

        {/* Community Stats */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { icon: Users, label: "Teams", value: "0" },
            { icon: MessageCircle, label: "Posts", value: String(postCount) },
            { icon: Heart, label: "Likes", value: String(likeCount) },
            { icon: Calendar, label: "Years", value: viewProfile?.created_at ? String(new Date().getFullYear() - new Date(viewProfile.created_at).getFullYear() || 1) : "1" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl p-3 border border-border shadow-card text-center">
              <stat.icon className="h-4 w-4 mx-auto mb-1.5 text-muted-foreground" />
              <div className="text-lg font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-[10px] text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* About */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-card">
          <h2 className="font-display font-semibold text-foreground mb-2">About {isOwnProfile ? "Me" : viewProfile?.name}</h2>
          <p className="text-sm text-muted-foreground">{viewProfile?.bio || (isOwnProfile ? "No bio yet. Edit your profile to add one." : "No bio available.")}</p>
        </div>

        {/* Activity / Favorites tabs */}
        <div>
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
            {(["activity", "favorites"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                  activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="text-center py-8 text-sm text-muted-foreground">
            {activeTab === "activity" ? (
              viewRole === "athlete" && athlete ? (
                <div className="space-y-6 text-left">
                  {/* Latest Performance Snapshot */}
                  {metrics.length > 0 && (
                    <div className="bg-muted/30 rounded-xl p-4 border border-border">
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-primary" /> Latest Performance
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                          { label: "40m Sprint", value: metrics[0].sprint_40m_s ? `${metrics[0].sprint_40m_s}s` : "—" },
                          { label: "VO2 Max", value: metrics[0].vo2_max || "—" },
                          { label: "1RM Bench", value: metrics[0].bench_press_1rm_kg ? `${metrics[0].bench_press_1rm_kg}kg` : "—" },
                          { label: "Vert Jump", value: metrics[0].vertical_jump_cm ? `${metrics[0].vertical_jump_cm}cm` : "—" },
                        ].map(m => (
                          <div key={m.label} className="bg-card rounded-lg p-2 text-center border border-border">
                            <div className="text-lg font-bold text-foreground">{m.value}</div>
                            <div className="text-[10px] text-muted-foreground uppercase">{m.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Highlights Reel */}
                  {highlights.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <ImageIcon className="h-4 w-4 text-primary" /> Highlights
                      </h3>
                      <div className="grid grid-cols-3 gap-2">
                        {highlights.map(h => (
                          <div key={h.id} className="aspect-square rounded-lg bg-muted overflow-hidden border border-border group relative">
                            {h.media_type === "video" ? (
                              <div className="w-full h-full flex items-center justify-center bg-black/20">
                                <Video className="h-6 w-6 text-white/50" />
                              </div>
                            ) : (
                              <img src={h.file_url} className="w-full h-full object-cover" alt="" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recent Matches */}
                  {matches.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                        <Trophy className="h-4 w-4 text-primary" /> Recent Matches
                      </h3>
                      <div className="space-y-2">
                        {matches.map(m => (
                          <div key={m.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-card">
                            <div>
                              <div className="text-sm font-semibold text-foreground">vs {m.opponent}</div>
                              <div className="text-[10px] text-muted-foreground">
                                {new Date(m.match_date).toLocaleDateString("en", { month: "short", day: "numeric" })}
                              </div>
                            </div>
                            <div className={`text-xs font-bold ${m.result === 'win' ? 'text-stat-green' : m.result === 'loss' ? 'text-stat-red' : 'text-gold'}`}>
                              {m.result ? m.result.toUpperCase() : '—'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {matches.length === 0 && highlights.length === 0 && metrics.length === 0 && (
                    <div className="text-center py-4">{isOwnProfile ? "Your recent activity will appear here." : `${viewProfile?.name}'s recent activity will appear here.`}</div>
                  )}
                </div>
              ) : (
                isOwnProfile ? "Your recent activity will appear here." : `${viewProfile?.name}'s recent activity will appear here.`
              )
            ) : (
              isOwnProfile ? "Your favorite teams and athletes will appear here." : `${viewProfile?.name}'s favorite teams and athletes will appear here.`
            )}
          </div>
        </div>

        {/* Coach M AI */}
        <div className="rounded-2xl bg-gradient-hero p-5 shadow-elevated">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bot className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-display font-semibold text-primary-foreground text-sm">Coach M</h3>
              <p className="text-xs text-primary-foreground/50">Your AI sports assistant</p>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gold/20 text-gold font-medium">Coming Soon</span>
          </div>
        </div>

        {/* Settings (Only own profile) */}
        {isOwnProfile && (
          <div className="bg-card rounded-xl border border-border shadow-card overflow-hidden">
            <h2 className="font-display font-semibold text-foreground p-5 pb-3">Settings</h2>
            {[
              { icon: User, label: "Account", action: openEditDialog },
              { icon: Moon, label: "Dark Mode", action: () => toast({ title: "Coming soon", description: "Dark mode is coming in a future update." }), badge: "Soon" },
              { icon: Globe, label: "Language", action: () => toast({ title: "Coming soon", description: "Language settings coming soon." }), badge: "English" },
              { icon: Award, label: "Promo Code", action: () => toast({ title: "Coming soon", description: "Promo codes coming soon." }) },
            ].map((item) => (
              <button
                key={item.label}
                className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/50 transition-colors"
                onClick={item.action}
              >
                <item.icon className="h-4 w-4 text-muted-foreground" />
                <span className="flex-1 text-left text-sm text-foreground">{item.label}</span>
                {item.badge && <span className="text-xs text-muted-foreground">{item.badge}</span>}
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
            <button
              className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-destructive/5 transition-colors text-destructive"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4" />
              <span className="flex-1 text-left text-sm">Sign Out</span>
            </button>
          </div>
        )}
      </div>

      {/* Edit Profile Dialog */}
      <Dialog open={showEdit} onOpenChange={setShowEdit}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-foreground">Name</Label>
              <Input className="mt-1.5" value={editName} onChange={(e) => setEditName(e.target.value)} />
              {formErrors.name && <p className="text-xs text-destructive mt-1">{formErrors.name}</p>}
            </div>
            <div>
              <Label className="text-foreground">Bio</Label>
              <Textarea className="mt-1.5" value={editBio} onChange={(e) => setEditBio(e.target.value)} placeholder="Tell us about yourself..." />
              {formErrors.bio && <p className="text-xs text-destructive mt-1">{formErrors.bio}</p>}
            </div>
            <div>
              <Label className="text-foreground">Favorite Sport</Label>
              <Select value={editSport} onValueChange={setEditSport}>
                <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select sport" /></SelectTrigger>
                <SelectContent>
                  {SPORT_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSaveProfile} disabled={saving} className="w-full" variant="hero">
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default ProfilePage;
