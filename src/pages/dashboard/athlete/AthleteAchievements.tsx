import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Star, Trophy, MessageSquare } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { ICON_MAP } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

const AthleteAchievements = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [feedback, setFeedback] = useState<any[]>([]);
  const [tab, setTab] = useState<"achievements" | "feedback">("achievements");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: athleteData } = await supabase
        .from("athletes").select("id").eq("profile_id", user.id).maybeSingle();

      if (athleteData) {
        const [achRes, fbRes] = await Promise.all([
          supabase.from("achievements").select("*").eq("athlete_id", athleteData.id).order("date_earned", { ascending: false }),
          supabase.from("coach_feedback" as any).select("*, institutions(institution_name)").eq("athlete_id", athleteData.id).order("created_at", { ascending: false }),
        ]);
        if (!achRes.error) setAchievements(achRes.data || []);
        if (!fbRes.error) setFeedback((fbRes.data as any[]) || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) {
    return (
      <DashboardLayout role="athlete">
        <div className="md:ml-16 space-y-4">
          {[1, 2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Achievements & Feedback</h1>
          <p className="text-sm text-muted-foreground mt-1">Your awards and coaching notes from your institution.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 p-1 rounded-lg w-fit">
          {(["achievements", "feedback"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize ${tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {t === "achievements" ? "Achievements" : "Coach Feedback"}
            </button>
          ))}
        </div>

        {tab === "achievements" && (
          achievements.length === 0 ? (
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
                  <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                    className="bg-card rounded-xl p-4 border border-border shadow-card text-center">
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
          )
        )}

        {tab === "feedback" && (
          feedback.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <h3 className="font-display font-semibold text-foreground mb-1">No feedback yet</h3>
              <p className="text-sm text-muted-foreground">Your coach or institution will leave feedback here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {feedback.map((fb: any, i) => (
                <motion.div key={fb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="bg-card rounded-xl p-5 border border-border shadow-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-semibold text-foreground">{fb.institutions?.institution_name || "Your Institution"}</div>
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(r => (
                        <Star key={r} className={`h-4 w-4 ${r <= fb.rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 leading-relaxed">{fb.feedback_text}</p>
                  <div className="text-xs text-muted-foreground mt-3">
                    {new Date(fb.created_at).toLocaleDateString("en", { month: "long", day: "numeric", year: "numeric" })}
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </div>
    </DashboardLayout>
  );
};

export default AthleteAchievements;
