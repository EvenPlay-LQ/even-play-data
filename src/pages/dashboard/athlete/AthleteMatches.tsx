import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Trophy } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const AthleteMatches = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: athleteData } = await supabase
        .from("athletes").select("id").eq("profile_id", user.id).maybeSingle();

      if (athleteData) {
        const { data, error } = await supabase
          .from("match_stats")
          .select("*, matches(*)")
          .eq("athlete_id", athleteData.id)
          .order("created_at", { ascending: false });

        if (error) handleQueryError(error, "Failed to load matches.");
        else setMatches(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">My Matches</h1>

        {matches.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">No match data yet</h3>
            <p className="text-sm text-muted-foreground">Your match statistics will appear here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {matches.map((stat, i) => (
              <motion.div
                key={stat.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{stat.matches?.competition || "Match"}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.matches?.match_date ? new Date(stat.matches.match_date).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" }) : "—"}
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
    </DashboardLayout>
  );
};

export default AthleteMatches;
