import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, TrendingUp, Star, Flame, Shield, Calendar, ChevronRight, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { LEVEL_NAMES, ICON_MAP, xpToNextLevel, getLevelName } from "@/config/constants";

const AthleteDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [athlete, setAthlete] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [totalGoals, setTotalGoals] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      // Fetch athlete + profile
      const { data: athleteData } = await supabase
        .from("athletes")
        .select("*, profiles(*)")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (athleteData) {
        setAthlete(athleteData);
        setProfile(athleteData.profiles);

        // Fetch match stats with match info
        const { data: stats } = await supabase
          .from("match_stats")
          .select("*, matches(*)")
          .eq("athlete_id", athleteData.id)
          .order("created_at", { ascending: false })
          .limit(5);

        if (stats) {
          setRecentMatches(stats);
          const goals = stats.reduce((sum: number, s: any) => sum + (s.goals || 0), 0);
          setTotalGoals(goals);
        }

        // Fetch achievements
        const { data: achData } = await supabase
          .from("achievements")
          .select("*")
          .eq("athlete_id", athleteData.id);

        if (achData) setAchievements(achData);
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
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!athlete) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 flex flex-col items-center justify-center py-20 text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">No Athlete Profile</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your athlete profile hasn't been created yet. Contact your institution or set up your profile.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const xpToNext = xpToNextLevel(athlete.level);
  const xpPercent = Math.min((athlete.xp_points / xpToNext) * 100, 100);
  const levelName = getLevelName(athlete.level);

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-gradient-hero p-6 shadow-elevated"
        >
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center">
              <span className="font-display font-bold text-2xl text-primary">
                {(profile?.name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="font-display font-bold text-xl text-primary-foreground">{profile?.name || "Athlete"}</h1>
              <p className="text-primary-foreground/60 text-sm">{athlete.position} · {athlete.sport}</p>
              <p className="text-primary-foreground/40 text-xs mt-0.5">{athlete.country}</p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-semibold text-primary">Lvl {athlete.level}</span>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-primary-foreground/50 mb-1.5">
              <span>{levelName}</span>
              <span>{athlete.xp_points} / {xpToNext} XP</span>
            </div>
            <div className="h-2 rounded-full bg-primary-foreground/10">
              <div className="h-full rounded-full bg-gradient-energy transition-all" style={{ width: `${xpPercent}%` }} />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Performance", value: Number(athlete.performance_score), icon: TrendingUp, color: "text-primary" },
            { label: "Matches", value: recentMatches.length, icon: Shield, color: "text-stat-blue" },
            { label: "Goals", value: totalGoals, icon: Trophy, color: "text-gold" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="bg-card rounded-xl p-4 shadow-card border border-border text-center"
            >
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Achievements */}
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

        {/* Recent Matches */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Recent Matches</h2>
          </div>
          {recentMatches.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No match data yet.</div>
          ) : (
            <div className="space-y-2">
              {recentMatches.map((stat, i) => (
                <motion.div
                  key={stat.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">
                      {stat.matches?.competition || "Match"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {stat.matches?.match_date ? new Date(stat.matches.match_date).toLocaleDateString("en", { month: "short", day: "numeric" }) : "—"}
                      {" · "}{stat.goals}G {stat.assists}A · {stat.minutes_played}min
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display font-bold text-foreground">{Number(stat.rating).toFixed(1)}</div>
                    <div className="text-[10px] text-muted-foreground">Rating</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Performance Trend */}
        {recentMatches.length > 0 && (
          <div className="bg-card rounded-xl p-5 border border-border shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-4">Performance Trend</h2>
            <div className="space-y-3">
              {[
                { label: "Avg Rating", value: Math.round(recentMatches.reduce((s, m) => s + Number(m.rating || 0), 0) / recentMatches.length * 10) },
                { label: "Goals/Match", value: Math.round((totalGoals / recentMatches.length) * 100) },
                { label: "Minutes/Match", value: Math.round(recentMatches.reduce((s, m) => s + (m.minutes_played || 0), 0) / recentMatches.length) },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-semibold text-foreground">{metric.value}%</span>
                  </div>
                  <Progress value={Math.min(metric.value, 100)} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteDashboard;
