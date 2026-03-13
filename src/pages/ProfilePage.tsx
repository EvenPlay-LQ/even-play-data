import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Star, Calendar, Heart, MessageCircle, Users, Settings,
  LogOut, Moon, Globe, LayoutDashboard, ChevronRight, Bot, Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/AppLayout";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { profile, primaryRole, loading } = useProfile();
  const [activeTab, setActiveTab] = useState<"activity" | "favorites">("activity");

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
            <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-gold/10">
              <Star className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs font-semibold text-gold">{profile?.reputation || 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Shortcut */}
        {dashboardPath && (
          <Button
            variant="outline"
            className="w-full justify-between h-12 rounded-xl"
            onClick={() => navigate(dashboardPath)}
          >
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
            { icon: MessageCircle, label: "Posts", value: "0" },
            { icon: Heart, label: "Likes", value: "0" },
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
            { icon: User, label: "Account", action: () => {} },
            { icon: Moon, label: "Dark Mode", action: () => {}, badge: "Soon" },
            { icon: Globe, label: "Language", action: () => {}, badge: "English" },
            { icon: Award, label: "Promo Code", action: () => {} },
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
    </AppLayout>
  );
};

export default ProfilePage;
