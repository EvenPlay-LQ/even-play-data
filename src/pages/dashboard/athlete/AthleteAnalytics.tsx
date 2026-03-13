import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const AthleteAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [athlete, setAthlete] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: athleteData, error: aErr } = await supabase
        .from("athletes").select("*").eq("profile_id", user.id).maybeSingle();

      if (aErr) { handleQueryError(aErr); setLoading(false); return; }
      setAthlete(athleteData);

      if (athleteData) {
        const { data, error } = await supabase
          .from("match_stats").select("*").eq("athlete_id", athleteData.id);
        if (error) handleQueryError(error);
        else setStats(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <DashboardLayout role="athlete"><div className="md:ml-16 space-y-4"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;
  }

  const totalMatches = stats.length;
  const avgRating = totalMatches > 0 ? (stats.reduce((s, m) => s + Number(m.rating || 0), 0) / totalMatches) : 0;
  const totalGoals = stats.reduce((s, m) => s + (m.goals || 0), 0);
  const totalAssists = stats.reduce((s, m) => s + (m.assists || 0), 0);
  const avgMinutes = totalMatches > 0 ? Math.round(stats.reduce((s, m) => s + (m.minutes_played || 0), 0) / totalMatches) : 0;

  const metrics = [
    { label: "Avg Rating", value: Math.round(avgRating * 10), display: avgRating.toFixed(1) },
    { label: "Goals / Match", value: totalMatches > 0 ? Math.round((totalGoals / totalMatches) * 100) : 0, display: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : "0" },
    { label: "Assists / Match", value: totalMatches > 0 ? Math.round((totalAssists / totalMatches) * 100) : 0, display: totalMatches > 0 ? (totalAssists / totalMatches).toFixed(2) : "0" },
    { label: "Avg Minutes", value: Math.min(avgMinutes, 100), display: String(avgMinutes) },
  ];

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>

        {!athlete ? (
          <div className="text-center py-20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No athlete profile found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Matches", value: totalMatches },
                { label: "Total Goals", value: totalGoals },
                { label: "Total Assists", value: totalAssists },
                { label: "Performance", value: Number(athlete.performance_score).toFixed(0) },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
                  <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-5 border border-border shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-4">Performance Metrics</h2>
              <div className="space-y-3">
                {metrics.map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-semibold text-foreground">{m.display}</span>
                    </div>
                    <Progress value={Math.min(m.value, 100)} className="h-2" />
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteAnalytics;
