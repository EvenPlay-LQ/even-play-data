import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Dumbbell, Zap } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const AthleteAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any[]>([]);
  const [perfTests, setPerfTests] = useState<any[]>([]);
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
        const [statsRes, testsRes] = await Promise.all([
          supabase.from("match_stats").select("*").eq("athlete_id", athleteData.id),
          supabase.from("performance_tests" as any).select("*").eq("athlete_id", athleteData.id).order("test_date", { ascending: false }),
        ]);
        if (!statsRes.error) setStats(statsRes.data || []);
        if (!testsRes.error) setPerfTests((testsRes.data as any[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  const totalMatches = stats.length;
  const avgRating = totalMatches > 0 ? (stats.reduce((s, m) => s + Number(m.rating || 0), 0) / totalMatches) : 0;
  const totalGoals = stats.reduce((s, m) => s + (m.goals || 0), 0);
  const totalAssists = stats.reduce((s, m) => s + (m.assists || 0), 0);

  const metricColor = (metric: string) => {
    const colorMap: Record<string, string> = {
      "Speed": "text-energy",
      "Sprint": "text-stat-red",
      "Strength": "text-stat-blue",
      "Agility": "text-gold",
    };
    for (const [key, color] of Object.entries(colorMap)) {
      if (metric.toLowerCase().includes(key.toLowerCase())) return color;
    }
    return "text-primary";
  };

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Analytics & Performance</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your match statistics and fitness test results.</p>
        </div>

        {!athlete ? (
          <div className="text-center py-20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No athlete profile found.</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Matches", value: totalMatches },
                { label: "Goals", value: totalGoals },
                { label: "Assists", value: totalAssists },
                { label: "Performance", value: Number(athlete.performance_score).toFixed(0) },
              ].map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
                  <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Match Analytics Progress */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" /> Match Metrics
              </h2>
              {totalMatches === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-6">No match stats recorded yet.</p>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Avg Rating / 10", value: avgRating * 10, display: avgRating.toFixed(1) },
                    { label: "Goals per Match", value: Math.min((totalGoals / totalMatches) * 100, 100), display: (totalGoals / totalMatches).toFixed(2) },
                    { label: "Assists per Match", value: Math.min((totalAssists / totalMatches) * 100, 100), display: (totalAssists / totalMatches).toFixed(2) },
                  ].map(m => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="font-semibold text-foreground">{m.display}</span>
                      </div>
                      <Progress value={Math.min(m.value, 100)} className="h-2" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Performance Tests */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
                <Dumbbell className="h-4 w-4 text-primary" /> Performance Tests
              </h2>
              {perfTests.length === 0 ? (
                <div className="text-center py-10">
                  <Zap className="h-10 w-10 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">No performance tests recorded yet. Your institution can add tests from their dashboard.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {perfTests.map((test, i) => (
                    <motion.div key={test.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-background">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <Dumbbell className={`h-4 w-4 ${metricColor(test.metric_name)}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground">{test.metric_name}</div>
                        <div className="text-xs text-muted-foreground">{new Date(test.test_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}</div>
                      </div>
                      <Badge variant="secondary" className="text-sm font-display font-bold">
                        {test.value} <span className="text-xs font-normal ml-0.5">{test.unit}</span>
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteAnalytics;
