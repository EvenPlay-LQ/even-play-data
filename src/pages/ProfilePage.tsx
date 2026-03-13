import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  User, Star, Calendar, Heart, MessageCircle, Users, Settings,
  LogOut, Moon, Globe, LayoutDashboard, ChevronRight, Bot, Award, Edit
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/AppLayout";
import { SPORT_OPTIONS } from "@/config/constants";
import { profileSchema } from "@/lib/validations";
import { handleQueryError } from "@/lib/queryHelpers";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, primaryRole, loading, updateProfile } = useProfile();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<"activity" | "favorites">("activity");
  const [postCount, setPostCount] = useState(0);
  const [likeCount, setLikeCount] = useState(0);
  const [showEdit, setShowEdit] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editSport, setEditSport] = useState("");
  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    const fetchStats = async () => {
      const [{ count: posts, error: e1 }, { count: likes, error: e2 }] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }).eq("author_id", user.id),
        supabase.from("likes").select("*", { count: "exact", head: true }).eq("user_id", user.id),
      ]);
      if (e1) handleQueryError(e1);
      if (e2) handleQueryError(e2);
      setPostCount(posts || 0);
      setLikeCount(likes || 0);
    };
    fetchStats();
  }, [user]);

  const openEditDialog = () => {
    setEditName(profile?.name || "");
    setEditBio(profile?.bio || "");
    setEditSport(profile?.favorite_sport || "");
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
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const dashboardPath = primaryRole === "institution"
    ? "/dashboard/institution"
    : primaryRole === "athlete"
      ? "/dashboard/athlete"
      : null;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
              {profile?.avatar ? (
                <img src={profile.avatar} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <span className="font-display font-bold text-2xl text-primary">
                  {(profile?.name || "U").split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              )}
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-foreground">{profile?.name || "User"}</h1>
              <p className="text-sm text-muted-foreground capitalize">{primaryRole} · {profile?.favorite_sport || "Sports"}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Member since {profile?.created_at ? new Date(profile.created_at).toLocaleDateString("en", { month: "short", year: "numeric" }) : "—"}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={openEditDialog}>
              <Edit className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10">
              <Star className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold">{profile?.reputation || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Shortcut */}
        {dashboardPath && (
          <Button variant="outline" className="w-full justify-between h-12 rounded-xl" onClick={() => navigate(dashboardPath)}>
            <span className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-primary" />
              Go to {primaryRole === "institution" ? "Institution" : "Athlete"} Dashboard
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
            { icon: Calendar, label: "Years", value: profile?.created_at ? String(new Date().getFullYear() - new Date(profile.created_at).getFullYear() || 1) : "1" },
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
          <h2 className="font-display font-semibold text-foreground mb-2">About Me</h2>
          <p className="text-sm text-muted-foreground">{profile?.bio || "No bio yet. Edit your profile to add one."}</p>
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
            {activeTab === "activity" ? "Your recent activity will appear here." : "Your favorite teams and athletes will appear here."}
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

        {/* Settings */}
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
