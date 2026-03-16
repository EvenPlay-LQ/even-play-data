import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy, TrendingUp, Star, Shield, Calendar, ChevronRight, Zap,
  BarChart3, Plus, UserCog, CheckCircle, MinusCircle, XCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ICON_MAP, xpToNextLevel, getLevelName } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

const RESULT_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  win:  { label: "W", color: "text-stat-green", icon: CheckCircle },
  draw: { label: "D", color: "text-gold",       icon: MinusCircle },
  loss: { label: "L", color: "text-stat-red",   icon: XCircle },
};

const AthleteDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [athleteMatches, setAthleteMatches] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [latestMetrics, setLatestMetrics] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      const { data: athleteData, error: aErr } = await supabase
        .from("athletes").select("*, profiles(*)").eq("profile_id", user.id).maybeSingle();
      if (aErr) { handleQueryError(aErr); setLoading(false); return; }

      if (athleteData) {
        setAthlete(athleteData);
        setProfile(athleteData.profiles);

        const [statsRes, amRes, achRes, metricsRes] = await Promise.all([
          supabase.from("match_stats").select("*, matches(*)").eq("athlete_id", athleteData.id).order("created_at", { ascending: false }).limit(3),
          supabase.from("athlete_matches" as any).select("*").eq("athlete_id", athleteData.id).order("match_date", { ascending: false }).limit(5),
          supabase.from("achievements").select("*").eq("athlete_id", athleteData.id),
          supabase.from("performance_metrics" as any).select("*").eq("athlete_id", athleteData.id).order("recorded_at", { ascending: false }).limit(1),
        ]);

        if (!statsRes.error) setRecentMatches(statsRes.data || []);
        if (!amRes.error) setAthleteMatches((amRes.data as any[]) || []);
        if (!achRes.error) setAchievements(achRes.data || []);
        if (!metricsRes.error && metricsRes.data?.length) setLatestMetrics(metricsRes.data[0]);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-6">
          <Skeleton className="h-44 rounded-2xl" />
          <div className="grid grid-cols-3 gap-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  // Onboarding state — no profile at all
  if (!athlete) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto gap-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Trophy className="h-10 w-10 text-primary" />
          </div>
          <h2 className="font-display font-bold text-2xl text-foreground">Create Your Athlete Profile</h2>
          <p className="text-sm text-muted-foreground">
            Set up your profile with your sport, position, bio, and more to unlock the full dashboard.
          </p>
          <Button onClick={() => navigate("/dashboard/athlete/profile")}>
            <Plus className="mr-2 h-4 w-4" /> Set Up Profile
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const xpToNext = xpToNextLevel(athlete.level);
  const xpPercent = Math.min((athlete.xp_points / xpToNext) * 100, 100);
  const levelName = getLevelName(athlete.level);

  const wins = athleteMatches.filter(m => m.result === "win").length;
  const totalPlayed = athleteMatches.length;
  const winRate = totalPlayed > 0 ? Math.round((wins / totalPlayed) * 100) : 0;
  const totalGoals = athleteMatches.reduce((s, m) => s + (m.goals || 0), 0);

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">

        {/* ═══ Hero Profile Card ═══ */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-hero p-5 md:p-6 shadow-elevated">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border-2 border-primary/20 shadow-glow">
              {profile?.avatar ? (
                <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover rounded-2xl" />
              ) : (
                <span className="font-display font-bold text-3xl sm:text-2xl text-primary">
                  {(profile?.name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-2xl sm:text-xl text-primary-foreground truncate">{profile?.name || "Athlete"}</h1>
              <p className="text-primary-foreground/80 text-sm font-medium">
                {athlete.sport}{athlete.position ? ` · ${athlete.position}` : ""}
              </p>
              {athlete.country && <p className="text-primary-foreground/40 text-xs mt-0.5">{athlete.country}</p>}
            </div>
            <div className="flex flex-col items-center sm:items-end gap-2 mt-2 sm:mt-0">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-bold text-primary">LVL {athlete.level}</span>
              </div>
            </div>
          </div>
          <div className="mt-6 sm:mt-5">
            <div className="flex justify-between text-[11px] sm:text-xs text-primary-foreground/60 mb-2">
              <span className="font-medium uppercase tracking-wider">{levelName}</span>
              <span className="font-semibold">{athlete.xp_points} / {xpToNext} XP</span>
            </div>
            <div className="h-2 rounded-full bg-primary-foreground/10 overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${xpPercent}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-energy" 
              />
            </div>
          </div>
        </motion.div>

        {/* ═══ Performance Snapshot ═══ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Matches", value: totalPlayed, icon: Shield, color: "text-stat-blue" },
            { label: "Win Rate", value: `${winRate}%`, icon: TrendingUp, color: "text-stat-green" },
            { label: "Goals", value: totalGoals, icon: Trophy, color: "text-gold" },
            { label: "Performance", value: Number(athlete.performance_score || 0).toFixed(0), icon: BarChart3, color: "text-primary" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 + i * 0.06 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border text-center">
              <s.icon className={`h-5 w-5 mx-auto mb-2 ${s.color}`} />
              <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ═══ Quick Actions ═══ */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Log Match", icon: Calendar, path: "/dashboard/athlete/matches", color: "text-primary" },
            { label: "Record Metrics", icon: BarChart3, path: "/dashboard/athlete/analytics", color: "text-stat-blue" },
            { label: "Edit Profile", icon: UserCog, path: "/dashboard/athlete/profile", color: "text-gold" },
          ].map((a, i) => (
            <motion.button key={a.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.06 }}
              onClick={() => navigate(a.path)}
              className="bg-card rounded-xl p-4 border border-border shadow-card flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-muted/30 transition-all">
              <a.icon className={`h-5 w-5 ${a.color}`} />
              <span className="text-xs font-medium text-foreground">{a.label}</span>
            </motion.button>
          ))}
        </div>

        {/* ═══ Current Fitness Metrics ═══ */}
        {latestMetrics ? (
          <div className="bg-card rounded-xl p-5 border border-border shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">Fitness Snapshot</h2>
              <button onClick={() => navigate("/dashboard/athlete/analytics")}
                className="text-xs text-primary flex items-center gap-1 hover:underline">
                View Analytics <ChevronRight className="h-3 w-3" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Speed", value: latestMetrics.speed },
                { label: "Endurance", value: latestMetrics.endurance },
                { label: "Strength", value: latestMetrics.strength },
                { label: "Agility", value: latestMetrics.agility },
              ].map(m => (
                <div key={m.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-semibold text-foreground">{m.value}</span>
                  </div>
                  <Progress value={Math.min(Number(m.value || 0), 100)} className="h-1.5" />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-xl p-5 border border-dashed border-border text-center">
            <BarChart3 className="h-8 w-8 mx-auto mb-2 text-muted-foreground/40" />
            <p className="text-sm font-medium text-foreground mb-1">Record Performance Metrics</p>
            <p className="text-xs text-muted-foreground mb-3">Track your speed, endurance, and strength progress.</p>
            <Button size="sm" variant="outline" onClick={() => navigate("/dashboard/athlete/analytics")}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Record Metrics
            </Button>
          </div>
        )}

        {/* ═══ Achievements ═══ */}
        {achievements.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-foreground mb-3">Achievements</h2>
            <div className="flex gap-3 overflow-x-auto pb-2">
              {achievements.map((a) => {
                const Icon = ICON_MAP[a.icon] || Star;
                return (
                  <div key={a.id} className="flex-shrink-0 bg-card rounded-xl p-4 border border-border shadow-card min-w-[140px]">
                    <Icon className="h-6 w-6 mb-2 text-gold" />
                    <div className="text-sm font-semibold text-foreground">{a.title}</div>
                    <div className="text-xs text-muted-foreground">{a.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══ Recent Matches ═══ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Recent Matches</h2>
            <button onClick={() => navigate("/dashboard/athlete/matches")}
              className="text-xs text-primary flex items-center gap-1 hover:underline">
              View All <ChevronRight className="h-3 w-3" />
            </button>
          </div>
          {athleteMatches.length === 0 ? (
            <div className="bg-card rounded-xl p-5 border border-dashed border-border text-center">
              <Trophy className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm font-medium text-foreground mb-1">Add Your First Match</p>
              <p className="text-xs text-muted-foreground mb-3">Start logging games to track your progress.</p>
              <Button size="sm" onClick={() => navigate("/dashboard/athlete/matches")}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Log Match
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {athleteMatches.map((match, i) => {
                const rc = RESULT_CONFIG[match.result] || RESULT_CONFIG.draw;
                const ResultIcon = rc.icon;
                return (
                  <motion.div key={match.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                    className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${rc.color} bg-muted`}>
                      <ResultIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-foreground">vs {match.opponent}</div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(match.match_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                        {match.score && ` · ${match.score}`}
                        {` · ${match.goals}G ${match.assists}A`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-display font-bold ${rc.color}`}>{rc.label}</div>
                      <div className="text-[10px] text-muted-foreground">{Number(match.rating).toFixed(1)} rating</div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteDashboard;
