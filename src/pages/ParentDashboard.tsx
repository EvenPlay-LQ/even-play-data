import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Settings, Activity, Plus, Loader2, Trophy, ChevronRight } from "lucide-react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/DashboardLayout";
import { motion } from "framer-motion";

const ParentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<any>(null);
  const [linkedAthletes, setLinkedAthletes] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      
      // 1. Fetch parent record
      const { data: parentData, error: parentErr } = await supabase
        .from("parents" as any)
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      
      if (parentData && !parentErr) {
        const p = parentData as any;
        setParent(p);
        
        // 2. Fetch linked athletes
        // We join profiles (for name/avatar) and then join athletes (for stats)
        const { data: links } = await (supabase
          .from("parent_athlete_links" as any)
          .select("athlete_user_id, athlete:profiles!athlete_user_id(name, avatar, athletes(*))")
          .eq("parent_user_id", user.id) as any);
        
        if (links) {
          setLinkedAthletes(links.map((l: any) => {
            const athleteProfile = l.athlete;
            const athleteData = athleteProfile.athletes?.[0] || athleteProfile.athletes;
            return {
              ...athleteData,
              profile_id: l.athlete_user_id,
              profiles: {
                name: athleteProfile.name,
                avatar: athleteProfile.avatar
              }
            };
          }));
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="parent">
        <div className="md:ml-16 space-y-6">
          <Skeleton className="h-20 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-48 rounded-xl" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="parent">
      <div className="md:ml-16 space-y-8">
        <SEO title="Parent Dashboard | Even Playground" />
        
        {/* ── Welcome Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Parent Dashboard</h1>
            <p className="text-sm text-muted-foreground">Monitoring progress for your athlete family</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/buzz")}>Community Buzz</Button>
          </div>
        </div>

        {/* ── Main Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Linked Athletes Section */}
          <div className="md:col-span-2 space-y-4">
            <h2 className="text-lg font-display font-semibold text-foreground flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Linked Athletes
            </h2>
            
            {linkedAthletes.length === 0 ? (
              <div className="bg-card p-8 rounded-2xl border border-dashed border-border text-center flex flex-col items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <Plus className="h-8 w-8 text-primary" />
                </div>
                <div className="max-w-xs">
                  <h3 className="font-semibold text-foreground">No Athletes Linked</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Link your child's athlete profile to monitor their performance and achievements.
                  </p>
                </div>
                <Button variant="hero" size="sm" className="mt-2">
                  Link an Athlete
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {linkedAthletes.map((athlete, i) => (
                  <motion.div 
                    key={athlete.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-card rounded-2xl border border-border p-4 shadow-sm hover:border-primary/30 transition-all group"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {athlete.profiles?.avatar ? (
                          <img src={athlete.profiles.avatar} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                          athlete.profiles?.name?.charAt(0) || "A"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground truncate">{athlete.profiles?.name}</h3>
                        <p className="text-xs text-muted-foreground">{athlete.sport} · {athlete.position}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-primary">{Number(athlete.performance_score).toFixed(0)}</div>
                        <div className="text-[10px] text-muted-foreground">Score</div>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Trophy className="h-3 w-3 text-gold" />
                        <span className="text-[10px] text-muted-foreground">Lvl {athlete.level}</span>
                      </div>
                      <button 
                        onClick={() => navigate(`/profile?id=${athlete.profile_id}`)}
                        className="text-xs text-primary font-medium flex items-center gap-1 group-hover:underline"
                      >
                        View Full Profile <ChevronRight className="h-3 w-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Side Info Cards */}
          <div className="space-y-6">
            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="w-10 h-10 bg-stat-blue/10 rounded-lg flex items-center justify-center text-stat-blue mb-4">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-md font-semibold text-foreground mb-1">Global Activity</h3>
              <p className="text-muted-foreground text-xs mb-4">Track recent matches and stats across all linked athletes.</p>
              <Button variant="outline" size="sm" className="w-full">View Global Tracker</Button>
            </div>

            <div className="bg-card p-6 rounded-2xl border border-border shadow-sm">
              <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center text-muted-foreground mb-4">
                <Settings className="w-5 h-5" />
              </div>
              <h3 className="text-md font-semibold text-foreground mb-1">Preferences</h3>
              <p className="text-muted-foreground text-xs mb-4">Update your contact info and notification settings.</p>
              <Button variant="outline" size="sm" className="w-full">Account Settings</Button>
            </div>
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
};

export default ParentDashboard;
