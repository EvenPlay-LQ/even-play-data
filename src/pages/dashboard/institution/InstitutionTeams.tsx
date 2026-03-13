import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, Building2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const InstitutionTeams = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [teams, setTeams] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: inst } = await supabase
        .from("institutions").select("id").eq("profile_id", user.id).maybeSingle();
      if (inst) {
        const { data, error } = await supabase
          .from("teams").select("*, team_members(id)").eq("institution_id", inst.id);
        if (error) handleQueryError(error);
        else setTeams(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <DashboardLayout role="institution"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Teams</h1>

        {teams.length === 0 ? (
          <div className="text-center py-20">
            <Building2 className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No teams created yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {teams.map((team, i) => (
              <motion.div key={team.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl p-5 border border-border shadow-card">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{team.team_name}</h3>
                    <p className="text-xs text-muted-foreground">{team.sport} · {team.season || "Current"}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {team.team_members?.length || 0} members
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstitutionTeams;
