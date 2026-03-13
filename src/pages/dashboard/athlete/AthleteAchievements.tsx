import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Trophy } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ICON_MAP } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

const AthleteAchievements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: athleteData } = await supabase
        .from("athletes").select("id").eq("profile_id", user.id).maybeSingle();

      if (athleteData) {
        const { data, error } = await supabase
          .from("achievements").select("*").eq("athlete_id", athleteData.id).order("date_earned", { ascending: false });
        if (error) handleQueryError(error);
        else setAchievements(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return <DashboardLayout role="athlete"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Achievements</h1>

        {achievements.length === 0 ? (
          <div className="text-center py-20">
            <Trophy className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">No achievements yet</h3>
            <p className="text-sm text-muted-foreground">Keep playing to earn achievements!</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {achievements.map((a, i) => {
              const Icon = ICON_MAP[a.icon] || Star;
              return (
                <motion.div
                  key={a.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <Icon className="h-6 w-6 text-gold" />
                  </div>
                  <div className="text-sm font-semibold text-foreground">{a.title}</div>
                  <div className="text-xs text-muted-foreground mt-1">{a.description}</div>
                  <div className="text-[10px] text-muted-foreground mt-2">
                    {new Date(a.date_earned).toLocaleDateString("en", { month: "short", year: "numeric" })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteAchievements;
