import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle, Clock, Calendar, ChevronRight, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      // Fetch institution
      const { data: inst } = await supabase
        .from("institutions")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (inst) {
        setInstitution(inst);

        // Fetch athletes linked to this institution
        const { data: athData } = await supabase
          .from("athletes")
          .select("*, profiles(name)")
          .eq("institution_id", inst.id)
          .order("performance_score", { ascending: false });

        if (athData) setAthletes(athData);

        // Fetch teams
        const { data: teamData } = await supabase
          .from("teams")
          .select("*")
          .eq("institution_id", inst.id);

        if (teamData) {
          setTeams(teamData);

          // Fetch upcoming matches for these teams
          const teamIds = teamData.map((t: any) => t.id);
          if (teamIds.length > 0) {
            const { data: matchData } = await supabase
              .from("matches")
              .select("*")
              .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`)
              .eq("status", "scheduled")
              .order("match_date", { ascending: true })
              .limit(5);

            if (matchData) setUpcomingMatches(matchData);
          }
        }

        // Fetch pending verifications
        const { count } = await supabase
          .from("verifications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        setPendingVerifications(count || 0);
      }

      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-6">
          <Skeleton className="h-16 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-40 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  if (!institution) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 flex flex-col items-center justify-center py-20 text-center">
          <Users className="h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="font-display font-bold text-xl text-foreground mb-2">No Institution Profile</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Your institution profile hasn't been set up yet. Complete your registration to get started.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const activeAthletes = athletes.length;
  const avgPerformance = athletes.length > 0
    ? Math.round(athletes.reduce((s, a) => s + Number(a.performance_score), 0) / athletes.length)
    : 0;

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">{institution.institution_name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{institution.institution_type} Dashboard</p>
        </motion.div>

        {/* Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Total Athletes", value: activeAthletes, icon: Users, color: "text-primary" },
            { label: "Teams", value: teams.length, icon: CheckCircle, color: "text-stat-green" },
            { label: "Pending", value: pendingVerifications, icon: Clock, color: "text-stat-orange" },
            { label: "Alerts", value: pendingVerifications, icon: AlertTriangle, color: "text-stat-red" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card"
            >
              <stat.icon className={`h-5 w-5 mb-2 ${stat.color}`} />
              <div className="text-2xl font-display font-bold text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Task Alerts */}
        {pendingVerifications > 0 && (
          <div className="bg-card rounded-xl p-5 border border-border shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-3">Task Alerts</h2>
            <div className="space-y-2">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <div className="w-8 h-8 rounded-lg bg-stat-orange/10 flex items-center justify-center">
                  <Clock className="h-4 w-4 text-stat-orange" />
                </div>
                <span className="text-sm text-foreground flex-1">{pendingVerifications} pending verifications</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </div>
        )}

        {/* Top Athletes */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-foreground">Top Athletes</h2>
          </div>
          {athletes.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">No athletes registered yet.</div>
          ) : (
            <div className="space-y-2">
              {athletes.slice(0, 5).map((ath, i) => (
                <motion.div
                  key={ath.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-display font-semibold text-sm text-primary">
                      {(ath.profiles?.name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{ath.profiles?.name || "Athlete"}</div>
                    <div className="text-xs text-muted-foreground">{ath.position} · {ath.sport}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display font-bold text-foreground">{Number(ath.performance_score)}</div>
                    <div className="text-[10px] text-muted-foreground">Lvl {ath.level}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div>
            <h2 className="font-display font-semibold text-foreground mb-3">Upcoming Matches</h2>
            <div className="space-y-2">
              {upcomingMatches.map((match) => (
                <div key={match.id} className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{match.competition || "Match"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString("en", { month: "short", day: "numeric" })} · {match.location}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{match.status}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Team Performance */}
        {athletes.length > 0 && (
          <div className="bg-card rounded-xl p-5 border border-border shadow-card">
            <h2 className="font-display font-semibold text-foreground mb-4">Team Averages</h2>
            <div className="space-y-3">
              {[
                { label: "Avg Performance", value: avgPerformance },
                { label: "Total Athletes", value: Math.min(activeAthletes * 10, 100) },
              ].map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{metric.label}</span>
                    <span className="font-semibold text-foreground">{metric.value}%</span>
                  </div>
                  <Progress value={metric.value} className="h-2" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstitutionDashboard;
