import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const InstitutionAnalytics = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [teamCount, setTeamCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: inst } = await supabase
        .from("institutions").select("id").eq("profile_id", user.id).maybeSingle();
      if (inst) {
        const [athRes, teamRes] = await Promise.all([
          supabase.from("athletes").select("*").eq("institution_id", inst.id),
          supabase.from("teams").select("id", { count: "exact", head: true }).eq("institution_id", inst.id),
        ]);
        if (athRes.error) handleQueryError(athRes.error);
        else setAthletes(athRes.data || []);
        setTeamCount(teamRes.count || 0);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <DashboardLayout role="institution"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;

  const avgPerformance = athletes.length > 0 ? Math.round(athletes.reduce((s, a) => s + Number(a.performance_score), 0) / athletes.length) : 0;
  const avgLevel = athletes.length > 0 ? (athletes.reduce((s, a) => s + a.level, 0) / athletes.length).toFixed(1) : "0";
  const totalXP = athletes.reduce((s, a) => s + a.xp_points, 0);

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Analytics</h1>

        {athletes.length === 0 ? (
          <div className="text-center py-20">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No data available yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Athletes", value: athletes.length },
                { label: "Teams", value: teamCount },
                { label: "Avg Level", value: avgLevel },
                { label: "Total XP", value: totalXP.toLocaleString() },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
                  <div className="text-2xl font-display font-bold text-foreground">{s.value}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-card rounded-xl p-5 border border-border shadow-card">
              <h2 className="font-display font-semibold text-foreground mb-4">Performance Distribution</h2>
              <div className="space-y-3">
                {[
                  { label: "Avg Performance Score", value: avgPerformance },
                  { label: "Athletes at Lvl 3+", value: Math.round((athletes.filter(a => a.level >= 3).length / athletes.length) * 100) },
                  { label: "Active Rate", value: Math.min(athletes.length * 10, 100) },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground">{m.label}</span>
                      <span className="font-semibold text-foreground">{m.value}%</span>
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

export default InstitutionAnalytics;
