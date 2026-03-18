import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, AlertTriangle, CheckCircle, Clock, Calendar, ChevronRight } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";
import { toast } from "@/hooks/use-toast";

const InstitutionDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [institution, setInstitution] = useState<any>(null);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState(0);
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [newAthlete, setNewAthlete] = useState({
    sport: "",
    position: "",
    province: "",
    country: "",
    date_of_birth: "",
  });

  // ------------------------------
  // Load institution, athletes, teams, matches, pending verifications
  // ------------------------------
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      // Fetch institution
      const { data: inst, error: instErr } = await supabase
        .from("institutions")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      if (instErr) {
        handleQueryError(instErr);
        setLoading(false);
        return;
      }

      if (inst) {
        setInstitution(inst);

        // Fetch athletes linked to this institution
        const { data: athData, error: athErr } = await supabase
          .from("athletes")
          .select("*, profiles(name)")
          .eq("institution_id", inst.id)
          .order("performance_score", { ascending: false });

        if (athErr) handleQueryError(athErr);
        if (athData) setAthletes(athData);

        // Fetch teams
        const { data: teamData, error: teamErr } = await supabase
          .from("teams")
          .select("*")
          .eq("institution_id", inst.id);

        if (teamErr) handleQueryError(teamErr);
        if (teamData) {
          setTeams(teamData);

          // Fetch upcoming matches
          const teamIds = teamData.map((t: any) => t.id);
          if (teamIds.length > 0) {
            const { data: matchData, error: matchErr } = await supabase
              .from("matches")
              .select("*")
              .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`)
              .eq("status", "scheduled")
              .order("match_date", { ascending: true })
              .limit(5);

            if (matchErr) handleQueryError(matchErr);
            if (matchData) setUpcomingMatches(matchData);
          }
        }

        // Fetch pending verifications
        const { count, error: verifErr } = await supabase
          .from("verifications")
          .select("*", { count: "exact", head: true })
          .eq("status", "pending");

        if (verifErr) handleQueryError(verifErr);
        setPendingVerifications(count || 0);
      }

      setLoading(false);
    };
    load();
  }, [user]);

  // ------------------------------
  // Handle adding a new athlete
  // ------------------------------
  const handleAddAthlete = async () => {
    if (!user || !institution?.id) {
      toast({
        title: "Error",
        description: "Cannot determine your profile or institution. Please refresh and try again.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);

    try {
      const { data, error } = await supabase
        .from("athletes")
        .upsert(
          {
            profile_id: user.id,
            institution_id: institution.id,
            sport: newAthlete.sport || "Football",
            position: newAthlete.position || null,
            province: newAthlete.province || null,
            country: newAthlete.country || null,
            date_of_birth: newAthlete.date_of_birth || null,
          },
          { onConflict: "profile_id" }
        )
        .select();

      if (error) {
        console.error("Upsert athlete error:", error);
        toast({
          title: "Error saving athlete",
          description: error.message,
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      // Refresh athlete list
      const { data: athData } = await supabase
        .from("athletes")
        .select("*, profiles(name)")
        .eq("institution_id", institution.id)
        .order("performance_score", { ascending: false });
      if (athData) setAthletes(athData);

      toast({
        title: "Athlete saved",
        description: "Athlete record saved successfully!",
      });

      setNewAthlete({ sport: "", position: "", province: "", country: "", date_of_birth: "" });
    } catch (err) {
      console.error("Unexpected error:", err);
      toast({
        title: "Unexpected error",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  // ------------------------------
  // Loading & fallback UI
  // ------------------------------
  if (loading) {
    return (
      <DashboardLayout role="institution">
        <div className="md:ml-16 space-y-6">
          <Skeleton className="h-16 rounded-xl" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
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
  const avgPerformance =
    athletes.length > 0
      ? Math.round(athletes.reduce((s, a) => s + Number(a.performance_score), 0) / athletes.length)
      : 0;

  // ------------------------------
  // JSX Layout
  // ------------------------------
  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold text-foreground">{institution.institution_name}</h1>
          <p className="text-sm text-muted-foreground capitalize">{institution.institution_type} Dashboard</p>
        </motion.div>

        {/* Add Athlete Form */}
        <div className="bg-card rounded-xl p-5 border border-border shadow-card mb-6">
          <h2 className="font-display font-semibold text-foreground mb-3">Add / Update Athlete Record</h2>
          <p className="text-xs text-muted-foreground mb-3">
            This creates or updates your own athlete record linked to this institution.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              placeholder="Sport (e.g. Football)"
              value={newAthlete.sport}
              onChange={(e) => setNewAthlete({ ...newAthlete, sport: e.target.value })}
              className="w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
            />
            <input
              placeholder="Position (e.g. Striker)"
              value={newAthlete.position}
              onChange={(e) => setNewAthlete({ ...newAthlete, position: e.target.value })}
              className="w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
            />
            <input
              placeholder="Date of Birth (YYYY-MM-DD)"
              value={newAthlete.date_of_birth}
              onChange={(e) => setNewAthlete({ ...newAthlete, date_of_birth: e.target.value })}
              className="w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
            />
            <input
              placeholder="Province / Region"
              value={newAthlete.province}
              onChange={(e) => setNewAthlete({ ...newAthlete, province: e.target.value })}
              className="w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
            />
            <input
              placeholder="Country"
              value={newAthlete.country}
              onChange={(e) => setNewAthlete({ ...newAthlete, country: e.target.value })}
              className="w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
            />
          </div>
          <button
            className="mt-3 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground px-4 py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            onClick={handleAddAthlete}
            disabled={saving || !newAthlete.sport}
          >
            {saving ? "Saving..." : "Save Athlete"}
          </button>
        </div>

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
                      {(ath.profiles?.name || "A")
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-foreground">{ath.profiles?.name || "Athlete"}</div>
                    <div className="text-xs text-muted-foreground">
                      {ath.position} · {ath.sport}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-display font-bold text-foreground">
                      {Number(ath.performance_score)}
                    </div>
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
                <div
                  key={match.id}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4"
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground">{match.competition || "Match"}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(match.match_date).toLocaleDateString("en", { month: "short", day: "numeric" })} ·{" "}
                      {match.location}
                    </div>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">
                    {match.status}
                  </span>
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
