import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle, Clock, XCircle, Shield } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { handleQueryError } from "@/lib/queryHelpers";

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string }> = {
  pending: { icon: Clock, color: "text-stat-orange bg-stat-orange/10" },
  verified: { icon: CheckCircle, color: "text-stat-green bg-stat-green/10" },
  rejected: { icon: XCircle, color: "text-stat-red bg-stat-red/10" },
};

const InstitutionVerifications = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("verifications").select("*").order("created_at", { ascending: false });
      if (error) handleQueryError(error);
      else setVerifications(data || []);
      setLoading(false);
    };
    load();
  }, [user]);

  if (loading) return <DashboardLayout role="institution"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="institution">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Verifications</h1>

        {verifications.length === 0 ? (
          <div className="text-center py-20">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No verifications found.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {verifications.map((v, i) => {
              const config = statusConfig[v.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.color.split(" ")[1]}`}>
                    <Icon className={`h-4 w-4 ${config.color.split(" ")[0]}`} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-foreground capitalize">{v.entity_type} Verification</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(v.created_at).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}
                      {v.notes && ` · ${v.notes}`}
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${config.color}`}>{v.status}</span>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default InstitutionVerifications;
