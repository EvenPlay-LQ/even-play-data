import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users, Building2, Trophy, FileText, Activity, ArrowRight,
  ShieldCheck, Globe, Zap, Clock, Server
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterAdmin } from "@/hooks/useMasterAdmin";
import { useAuth } from "@/hooks/useAuth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getPlatformStats, getAuditLog } = useMasterAdmin();
  const [stats, setStats] = useState<any>(null);
  const [recentActions, setRecentActions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [statsRes, auditRes] = await Promise.all([
        getPlatformStats(),
        getAuditLog(5),
      ]);
      setStats(statsRes);
      setRecentActions(auditRes.data);
      setLoading(false);
    };
    load();
  }, []);

  const statCards = stats ? [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-400", bg: "bg-blue-500/10" },
    { label: "Athletes", value: stats.totalAthletes, icon: Trophy, color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { label: "Institutions", value: stats.totalInstitutions, icon: Building2, color: "text-purple-400", bg: "bg-purple-500/10" },
    { label: "Posts", value: stats.totalPosts, icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
    { label: "Matches", value: stats.totalMatches, icon: Activity, color: "text-rose-400", bg: "bg-rose-500/10" },
  ] : [];

  if (loading) {
    return (
      <DashboardLayout role="master_admin">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="master_admin">
      <div className="md:ml-16 space-y-8">

        {/* ── Hero Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-950/60 via-slate-900/80 to-slate-950 border border-red-500/20 p-6 sm:p-8"
        >
          {/* Decorative grid */}
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "24px 24px" }} />

          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="p-3 rounded-2xl bg-red-500/15 border border-red-500/20 w-fit">
              <ShieldCheck className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-display font-bold text-white">
                Master Admin Console
              </h1>
              <p className="text-sm text-red-200/60 mt-1">
                Welcome back, <span className="text-red-300 font-medium">{user?.email}</span> · Full platform control enabled
              </p>
            </div>
          </div>

          {/* System Status Row */}
          <div className="relative flex flex-wrap gap-4 mt-6">
            {[
              { icon: Globe, label: "Platform", status: "Online", color: "text-emerald-400" },
              { icon: Server, label: "Database", status: "Healthy", color: "text-emerald-400" },
              { icon: Zap, label: "Auth", status: "Active", color: "text-emerald-400" },
              { icon: Clock, label: "Uptime", status: "—", color: "text-slate-400" },
            ].map(s => (
              <div key={s.label} className="flex items-center gap-2 text-xs">
                <s.icon className="h-3.5 w-3.5 text-red-300/50" />
                <span className="text-red-200/40">{s.label}:</span>
                <span className={`font-medium ${s.color}`}>{s.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Stats Grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {statCards.map((card, i) => (
            <motion.div key={card.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card hover:border-primary/30 transition-colors"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`p-1.5 rounded-lg ${card.bg}`}>
                  <card.icon className={`h-3.5 w-3.5 ${card.color}`} />
                </div>
                <span className="text-xs text-muted-foreground">{card.label}</span>
              </div>
              <div className="text-2xl font-display font-bold text-foreground">{card.value}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Admin Tools</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "User Management", desc: "View all users, edit roles, delete accounts", path: "/admin/users", icon: Users, accent: "border-l-blue-500" },
              { label: "User Diagnostics", desc: "Troubleshoot accounts, view config & activity", path: "/admin/diagnostics", icon: Activity, accent: "border-l-emerald-500" },
              { label: "Audit Trail", desc: "Review all administrative actions", path: "/admin/audit", icon: FileText, accent: "border-l-amber-500" },
            ].map((action, i) => (
              <motion.button key={action.path}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
                onClick={() => navigate(action.path)}
                className={`bg-card rounded-xl p-4 border border-border border-l-[3px] ${action.accent} shadow-card text-left hover:border-primary/40 transition-colors group`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <action.icon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">{action.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <span className="text-xs text-muted-foreground">{action.desc}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* ── Recent Admin Actions ── */}
        <div>
          <h2 className="text-lg font-display font-semibold text-foreground mb-3">Recent Admin Actions</h2>
          {recentActions.length === 0 ? (
            <div className="text-center py-10 bg-card rounded-xl border border-border">
              <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground/20 mb-3" />
              <p className="text-sm text-muted-foreground">No admin actions recorded yet.</p>
              <p className="text-xs text-muted-foreground mt-1">Actions will appear here as you manage the platform.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActions.map((log: any, i: number) => (
                <motion.div key={log.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="bg-card rounded-lg p-3 border border-border text-sm flex items-center justify-between">
                  <div>
                    <span className="font-medium text-foreground capitalize">{log.action?.replace(/_/g, " ")}</span>
                    {log.target_user_id && (
                      <span className="text-muted-foreground ml-2">→ {log.target_user_id.slice(0, 8)}…</span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                </motion.div>
              ))}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
