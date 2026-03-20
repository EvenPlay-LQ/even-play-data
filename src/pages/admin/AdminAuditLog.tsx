import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ScrollText, RefreshCw } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterAdmin } from "@/hooks/useMasterAdmin";

const AdminAuditLog = () => {
  const { getAuditLog } = useMasterAdmin();
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await getAuditLog(100);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const actionColor = (action: string) => {
    if (action.includes("delete")) return "text-red-400";
    if (action.includes("role")) return "text-amber-400";
    if (action.includes("impersonation")) return "text-purple-400";
    return "text-blue-400";
  };

  if (loading) {
    return (
      <DashboardLayout role="master_admin">
        <div className="md:ml-16 space-y-3">
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-12 rounded-lg" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="master_admin">
      <div className="md:ml-16 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Admin Audit Log</h1>
            <p className="text-sm text-muted-foreground">All administrative actions performed on the platform.</p>
          </div>
          <Button variant="outline" size="sm" onClick={load}>
            <RefreshCw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-20">
            <ScrollText className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">No audit log entries yet.</p>
          </div>
        ) : (
          <div className="space-y-1.5">
            {logs.map((log: any, i: number) => (
              <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                className="bg-card rounded-lg px-4 py-3 border border-border flex flex-wrap items-center gap-3 text-sm">
                {/* Timestamp */}
                <span className="text-xs text-muted-foreground w-36 flex-shrink-0">
                  {new Date(log.created_at).toLocaleString()}
                </span>
                {/* Action */}
                <span className={`font-semibold capitalize ${actionColor(log.action)}`}>
                  {log.action?.replace(/_/g, " ")}
                </span>
                {/* Target */}
                {log.target_entity && (
                  <span className="text-muted-foreground text-xs">on {log.target_entity}</span>
                )}
                {log.target_user_id && (
                  <span className="text-xs font-mono text-muted-foreground">{log.target_user_id.slice(0, 8)}…</span>
                )}
                {/* Details */}
                {log.details && Object.keys(log.details).length > 0 && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {JSON.stringify(log.details)}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminAuditLog;
