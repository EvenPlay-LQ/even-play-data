import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Zap } from "lucide-react";
import { Input } from "@/components/ui/input";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { getLevelName } from "@/config/constants";
import { handleQueryError } from "@/lib/queryHelpers";

const InstitutionAthletes = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [athletes, setAthletes] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data: inst } = await supabase
        .from("institutions").select("id").eq("profile_id", user.id).maybeSingle();
      if (inst) {
        const { data, error } = await supabase
          .from("athletes").select("*, profiles(name, avatar)").eq("institution_id", inst.id).order("performance_score", { ascending: false });
        if (error) handleQueryError(error);
        else setAthletes(data || []);
      }
      setLoading(false);
    };
    load();
  }, [user]);

  const filtered = athletes.filter((a) =>
    !search.trim() || (a.profiles?.name || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <DashboardLayout role="institution"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Athletes Roster</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search athletes..." className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No athletes found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map((ath, i) => (
              <motion.div key={ath.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="font-display font-semibold text-sm text-primary">
                    {(ath.profiles?.name || "A").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{ath.profiles?.name || "Athlete"}</div>
                  <div className="text-xs text-muted-foreground">{ath.position} · {ath.sport}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-display font-bold text-foreground">{Number(ath.performance_score).toFixed(0)}</div>
                  <div className="flex items-center gap-1 justify-end">
                    <Zap className="h-3 w-3 text-primary" />
                    <span className="text-[10px] text-muted-foreground">{getLevelName(ath.level)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstitutionAthletes;
