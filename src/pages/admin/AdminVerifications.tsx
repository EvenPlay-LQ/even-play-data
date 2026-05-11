import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, CheckCircle, Clock, XCircle, User, Building } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { handleQueryError } from "@/lib/queryHelpers";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const statusConfig: Record<string, { icon: typeof CheckCircle; color: string }> = {
  pending: { icon: Clock, color: "text-stat-orange bg-stat-orange/10" },
  verified: { icon: CheckCircle, color: "text-stat-green bg-stat-green/10" },
  rejected: { icon: XCircle, color: "text-stat-red bg-stat-red/10" },
};

const AdminVerifications = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<any[]>([]);

  const loadVerifications = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("verifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      handleQueryError(error);
    } else {
      setVerifications(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadVerifications();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("verifications")
      .update({ status: newStatus as any })
      .eq("id", id);
      
    if (error) {
      handleQueryError(error, "Failed to update status");
    } else {
      toast({ title: "Status updated", description: `Verification marked as ${newStatus}.` });
      loadVerifications();
    }
  };

  if (loading) return <DashboardLayout role="master_admin"><div className="md:ml-16"><Skeleton className="h-48 rounded-xl" /></div></DashboardLayout>;

  return (
    <DashboardLayout role="master_admin">
      <div className="md:ml-16 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Global Verifications</h1>
            <p className="text-sm text-muted-foreground">Manage athlete and institution verification queues.</p>
          </div>
        </div>

        {verifications.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-xl border border-border">
            <ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No verifications in the system.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {verifications.map((v, i) => {
              const config = statusConfig[v.status] || statusConfig.pending;
              const Icon = config.icon;
              return (
                <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-xl p-4 border border-border shadow-card flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${config.color.split(" ")[1]}`}>
                      <Icon className={`h-4 w-4 ${config.color.split(" ")[0]}`} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-foreground flex items-center gap-2">
                        {v.entity_type === 'athlete' ? <User className="h-3.5 w-3.5 text-muted-foreground" /> : <Building className="h-3.5 w-3.5 text-muted-foreground" />}
                        <span className="capitalize">{v.entity_type}</span> ID: {v.entity_id.slice(0, 8)}...
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(v.created_at).toLocaleString()}
                        {v.notes && ` · Notes: ${v.notes}`}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${config.color}`}>
                      {v.status}
                    </span>
                    {v.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="text-green-500 hover:text-green-600 hover:bg-green-500/10 border-green-500/20" onClick={() => handleUpdateStatus(v.id, 'verified')}>
                          Verify
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500 hover:text-red-600 hover:bg-red-500/10 border-red-500/20" onClick={() => handleUpdateStatus(v.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    )}
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

export default AdminVerifications;
