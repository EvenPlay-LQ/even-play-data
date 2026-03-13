import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const InstitutionMatches = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: inst } = await supabase
        .from("institutions").select("id").eq("profile_id", user.id).maybeSingle();
      if (inst) {
        const { data: teamData } = await supabase.from("teams").select("id").eq("institution_id", inst.id);
        const teamIds = (teamData || []).map((t: any) => t.id);
        if (teamIds.length > 0) {
          const { data, error } = await supabase
            .from("matches").select("*")
            .or(`home_team_id.in.(${teamIds.join(",")}),away_team_id.in.(${teamIds.join(",")})`)
            .order("match_date", { ascending: false });
          if (error) handleQueryError(error);
          else setMatches(data || []);
        }
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <DashboardLayout role="institution"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Matches</h1>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No matches found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((match, i) => (
              <motion.div key={match.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-foreground">{match.competition || "Match"}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(match.match_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })} · {match.location || "TBD"}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {match.status === "completed" && (
                    <span className="text-sm font-display font-bold text-foreground">{match.home_score} - {match.away_score}</span>
                  )}
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${
                    match.status === "completed" ? "bg-stat-green/10 text-stat-green" :
                    match.status === "live" ? "bg-stat-red/10 text-stat-red" :
                    match.status === "cancelled" ? "bg-muted text-muted-foreground" :
                    "bg-primary/10 text-primary"
                  }`}>{match.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstitutionMatches;
