import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, UserCog, Activity, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMasterAdmin } from "@/hooks/useMasterAdmin";
import { useToast } from "@/hooks/use-toast";

const AdminDiagnostics = () => {
  const { toast } = useToast();
  const { getUserDetail, getAllUsers, auditAction } = useMasterAdmin();
  const [searchParams, setSearchParams] = useSearchParams();
  const preselectedUser = searchParams.get("user");

  const [userId, setUserId] = useState(preselectedUser || "");
  const [userDetail, setUserDetail] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    getAllUsers().then(({ data }) => setAllUsers(data));
  }, [getAllUsers]);


  const loadUser = useCallback(async (id: string) => {
    setLoading(true);
    setUserId(id);
    const detail = await getUserDetail(id);
    setUserDetail(detail);
    setLoading(false);
    await auditAction("view_diagnostics", id, "profiles");
  }, [getUserDetail, auditAction]);

  useEffect(() => {
    if (preselectedUser) loadUser(preselectedUser);
  }, [preselectedUser, loadUser]);

  const filteredUsers = allUsers.filter(u =>
    !searchText.trim() || (u.name || "").toLowerCase().includes(searchText.toLowerCase()) || u.id.includes(searchText)
  ).slice(0, 20);

  return (
    <DashboardLayout role="master_admin">
      <div className="md:ml-16 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Diagnostics</h1>
          <p className="text-sm text-muted-foreground">Troubleshoot individual user accounts — view config, roles, activity, and errors.</p>
        </div>

        {/* User Picker */}
        <div className="bg-card rounded-xl p-4 border border-border shadow-card space-y-3">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search user by name or paste UUID…" className="pl-10"
                value={searchText} onChange={e => setSearchText(e.target.value)} />
            </div>
          </div>
          {searchText && (
            <div className="max-h-40 overflow-y-auto space-y-1">
              {filteredUsers.map(u => (
                <button key={u.id} onClick={() => { loadUser(u.id); setSearchText(""); }}
                  className="w-full text-left px-3 py-2 rounded-lg text-sm hover:bg-muted transition-colors flex items-center justify-between">
                  <span className="text-foreground font-medium">{u.name || "—"}</span>
                  <span className="text-xs text-muted-foreground">{u.user_type} · {u.id.slice(0, 8)}…</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && <div className="space-y-3">{[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>}

        {/* User Detail */}
        {!loading && userDetail && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Profile Card */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-card">
              <div className="flex items-center gap-3 mb-4">
                <UserCog className="h-5 w-5 text-primary" />
                <h2 className="text-lg font-display font-semibold text-foreground">User Configuration</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <div><span className="text-muted-foreground">Name</span><div className="font-medium text-foreground">{userDetail.profile?.name || "—"}</div></div>
                <div><span className="text-muted-foreground">User Type</span><div className="font-medium text-foreground capitalize">{userDetail.profile?.user_type || "—"}</div></div>
                <div><span className="text-muted-foreground">Roles</span><div className="font-medium text-foreground">{userDetail.roles?.join(", ") || "—"}</div></div>
                <div><span className="text-muted-foreground">Reputation</span><div className="font-medium text-foreground">{userDetail.profile?.reputation ?? 0}</div></div>
                <div><span className="text-muted-foreground">Created</span><div className="font-medium text-foreground">{userDetail.profile?.created_at ? new Date(userDetail.profile.created_at).toLocaleDateString() : "—"}</div></div>
                <div><span className="text-muted-foreground">UUID</span><div className="font-medium text-foreground font-mono text-xs">{userId}</div></div>
              </div>
            </div>

            {/* Athlete / Institution Detail */}
            {userDetail.athlete && (
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-2">Athlete Details</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Sport</span><div className="font-medium">{userDetail.athlete.sport}</div></div>
                  <div><span className="text-muted-foreground">Position</span><div className="font-medium">{userDetail.athlete.position || "—"}</div></div>
                  <div><span className="text-muted-foreground">Level</span><div className="font-medium">{userDetail.athlete.level}</div></div>
                  <div><span className="text-muted-foreground">XP</span><div className="font-medium">{userDetail.athlete.xp_points}</div></div>
                  {userDetail.athlete.institutions?.institution_name && (
                    <div className="col-span-2"><span className="text-muted-foreground">Institution</span><div className="font-medium">{userDetail.athlete.institutions.institution_name}</div></div>
                  )}
                </div>
              </div>
            )}

            {userDetail.institution && (
              <div className="bg-card rounded-xl p-5 border border-border shadow-card">
                <h3 className="text-sm font-semibold text-foreground mb-2">Institution Details</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name</span><div className="font-medium">{userDetail.institution.institution_name}</div></div>
                  <div><span className="text-muted-foreground">Type</span><div className="font-medium capitalize">{userDetail.institution.institution_type}</div></div>
                  <div><span className="text-muted-foreground">Country</span><div className="font-medium">{userDetail.institution.country || "—"}</div></div>
                  <div><span className="text-muted-foreground">Contact</span><div className="font-medium">{userDetail.institution.contact_email || "—"}</div></div>
                </div>
              </div>
            )}

            {/* Activity Log */}
            <div className="bg-card rounded-xl p-5 border border-border shadow-card">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Recent Activity (Audit Logs)</h3>
              </div>
              {userDetail.recentAuditLogs.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No activity recorded for this user.</p>
              ) : (
                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {userDetail.recentAuditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-center justify-between text-xs px-2 py-1.5 rounded-md bg-muted/50">
                      <span className="font-medium text-foreground capitalize">{log.action} — {log.entity_type}</span>
                      <span className="text-muted-foreground">{new Date(log.created_at).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Empty */}
        {!loading && !userDetail && (
          <div className="text-center py-20">
            <AlertTriangle className="h-10 w-10 mx-auto text-muted-foreground/30 mb-4" />
            <p className="text-sm text-muted-foreground">Select a user above to view their diagnostics.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDiagnostics;
