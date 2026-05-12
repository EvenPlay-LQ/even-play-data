import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, MapPin, Trophy, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

interface Fixture {
  id: string;
  kickoff_time: string;
  status: string;
  home_score?: number;
  away_score?: number;
  venue_name?: string;
  home_team?: { team_name: string };
  away_team?: { team_name: string };
  competition?: { competition_name: string };
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  scheduled: { label: "Scheduled", className: "bg-primary/10 text-primary border-primary/20" },
  live:      { label: "Live",      className: "bg-red-500/10 text-red-600 border-red-500/20 animate-pulse" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  postponed: { label: "Postponed", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  cancelled: { label: "Cancelled", className: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
};

const AthleteFixtures = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [institutionName, setInstitutionName] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed">("upcoming");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      // Get this athlete's institution
      const { data: athleteData } = await supabase
        .from("athletes")
        .select("institution_id, institutions(institution_name)")
        .eq("profile_id", user.id)
        .maybeSingle();

      const instId = athleteData?.institution_id;
      const instName = (athleteData?.institutions as any)?.institution_name ?? null;
      setInstitutionName(instName);

      if (!instId) {
        setLoading(false);
        return;
      }

      // Get teams belonging to this institution
      const { data: teamData } = await supabase
        .from("teams")
        .select("id")
        .eq("institution_id", instId);

      const teamIds = (teamData || []).map((t: any) => t.id);
      if (teamIds.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch fixtures involving those teams
      const { data: fixtureData } = await (supabase as any)
        .from("match_fixtures")
        .select(`
          *,
          home_team:home_team_id(team_name),
          away_team:away_team_id(team_name),
          competitions(competition_name)
        `)
        .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`)
        .order("kickoff_time", { ascending: true })
        .limit(50);

      setFixtures((fixtureData || []) as Fixture[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = fixtures.filter(f => {
    if (filter === "upcoming") return ["scheduled", "live"].includes(f.status);
    if (filter === "completed") return f.status === "completed";
    return true;
  });

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Team Fixtures</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {institutionName
              ? `Upcoming and past matches for ${institutionName}.`
              : "Join an institution to see your team's fixtures here."}
          </p>
        </div>

        {!institutionName ? (
          <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
            <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">You are not linked to any institution yet.</p>
          </div>
        ) : (
          <>
            {/* Filters */}
            <div className="flex gap-2">
              {(["upcoming", "all", "completed"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${
                    filter === f ? "bg-primary border-primary text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm text-muted-foreground">
                  {filter === "upcoming" ? "No upcoming fixtures scheduled." : "No fixtures found."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((fixture, i) => {
                  const cfg = STATUS_CONFIG[fixture.status] ?? STATUS_CONFIG.scheduled;
                  return (
                    <motion.div
                      key={fixture.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-card rounded-xl border border-border p-5 shadow-card"
                    >
                      {/* Teams & Score */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-display font-semibold text-base leading-tight">
                              {fixture.home_team?.team_name ?? "Home"} vs {fixture.away_team?.team_name ?? "Away"}
                            </h3>
                            {fixture.competition && (
                              <p className="text-[10px] text-muted-foreground truncate">
                                {(fixture.competition as any).competition_name}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.className} ml-2 flex-shrink-0`}>
                          {cfg.label}
                        </span>
                      </div>

                      {/* Completed Score */}
                      {fixture.status === "completed" && (
                        <div className="flex items-center justify-center gap-6 bg-muted/50 rounded-lg p-3 mb-3">
                          <div className="text-center">
                            <div className="text-2xl font-display font-bold">{fixture.home_score ?? 0}</div>
                            <div className="text-[10px] text-muted-foreground">Home</div>
                          </div>
                          <div className="text-lg font-bold text-muted-foreground">–</div>
                          <div className="text-center">
                            <div className="text-2xl font-display font-bold">{fixture.away_score ?? 0}</div>
                            <div className="text-[10px] text-muted-foreground">Away</div>
                          </div>
                        </div>
                      )}

                      {/* Meta */}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(fixture.kickoff_time), "MMM dd, yyyy")}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(fixture.kickoff_time), "hh:mm a")}
                        </span>
                        {fixture.venue_name && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {fixture.venue_name}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteFixtures;
