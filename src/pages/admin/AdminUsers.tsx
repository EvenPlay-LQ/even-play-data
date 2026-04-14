import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Search, Users, Loader2, Trash2, ShieldAlert, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { useMasterAdmin } from "@/hooks/useMasterAdmin";
import { useToast } from "@/hooks/use-toast";

const ROLE_OPTIONS = ["fan", "athlete", "institution", "coach", "referee", "scout"];

const AdminUsers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getAllUsers, updateUserRole, deleteUser, auditAction } = useMasterAdmin();
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Role editing
  const [editOpen, setEditOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newRole, setNewRole] = useState("");

  const loadUsers = async (q?: string) => {
    setLoading(true);
    const { data } = await getAllUsers(q);
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { 
    loadUsers(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = () => loadUsers(search);

  const handleChangeRole = async () => {
    if (!selectedUser || !newRole) return;
    setSaving(true);
    const { error } = await updateUserRole(selectedUser.id, newRole);
    if (error) {
      toast({ title: "Error", description: String(error.message ?? error), variant: "destructive" });
    } else {
      toast({ title: "Role updated", description: `${selectedUser.name} is now "${newRole}".` });
      setEditOpen(false);
      loadUsers(search);
    }
    setSaving(false);
  };

  const handleDelete = async (u: any) => {
    if (!confirm(`Delete user "${u.name}"? This cannot be undone.`)) return;
    const { error } = await deleteUser(u.id);
    if (error) {
      toast({ title: "Error", description: String(error.message ?? error), variant: "destructive" });
    } else {
      toast({ title: "User deleted" });
      setUsers(users.filter(x => x.id !== u.id));
    }
  };

  const getBadgeColor = (type: string) => {
    const map: Record<string, string> = {
      athlete: "bg-emerald-500/10 text-emerald-400",
      institution: "bg-purple-500/10 text-purple-400",
      fan: "bg-slate-500/10 text-slate-400",
      coach: "bg-amber-500/10 text-amber-400",
      master_admin: "bg-red-500/10 text-red-400",
    };
    return map[type] || "bg-slate-500/10 text-slate-400";
  };

  if (loading && users.length === 0) {
    return (
      <DashboardLayout role="master_admin">
        <div className="md:ml-16 space-y-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-16 rounded-xl" />)}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="master_admin">
      <div className="md:ml-16 space-y-6">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">User Management</h1>
          <p className="text-sm text-muted-foreground">View all platform users, change roles, and troubleshoot accounts.</p>
        </div>

        {/* Search */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name…"
              className="pl-10"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button variant="outline" onClick={handleSearch}>Search</Button>
        </div>

        {/* User Table */}
        <div className="space-y-2">
          {users.length === 0 ? (
            <div className="text-center py-20">
              <Users className="h-12 w-12 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-sm text-muted-foreground">No users found.</p>
            </div>
          ) : users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
              className="bg-card rounded-xl p-4 border border-border shadow-card flex items-center gap-4">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="font-display font-semibold text-sm text-primary">
                  {(u.name || "U").split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-foreground truncate">{u.name || "—"}</div>
                <div className="text-xs text-muted-foreground">{u.id.slice(0, 8)}… · Joined {new Date(u.created_at).toLocaleDateString()}</div>
              </div>

              {/* Role Badge */}
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium capitalize ${getBadgeColor(u.user_type)}`}>
                {u.user_type}
              </span>

              {/* Actions */}
              <div className="flex items-center gap-1.5">
                {/* Edit Role */}
                <Dialog open={editOpen && selectedUser?.id === u.id} onOpenChange={o => { setEditOpen(o); if (o) { setSelectedUser(u); setNewRole(u.user_type); } }}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon" className="h-8 w-8" title="Change role">
                      <ShieldAlert className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Change Role for {u.name}</DialogTitle></DialogHeader>
                    <div className="space-y-4 pt-2">
                      <div>
                        <Label>New Role</Label>
                        <select
                          className="mt-1 w-full border border-border rounded-md p-2 bg-background text-foreground text-sm"
                          value={newRole}
                          onChange={e => setNewRole(e.target.value)}
                        >
                          {ROLE_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                      </div>
                      <Button className="w-full" onClick={handleChangeRole} disabled={saving || newRole === u.user_type}>
                        {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                        Assign Role
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                {/* Troubleshoot */}
                <Button variant="outline" size="icon" className="h-8 w-8" title="Troubleshoot user"
                  onClick={() => navigate(`/admin/diagnostics?user=${u.id}`)}>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>

                {/* Delete */}
                {u.user_type !== "master_admin" && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" title="Delete user"
                    onClick={() => handleDelete(u)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
